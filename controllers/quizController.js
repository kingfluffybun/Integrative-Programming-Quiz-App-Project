const axios = require('axios')
const { validationResult } = require('express-validator')

// OpenTDB API base URL
const OPENTDB_API = 'https://opentdb.com/api.php'
const OPENTDB_CATEGORIES_API = 'https://opentdb.com/api_category.php'

// Get quiz questions from OpenTDB
const getQuestions = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters',
                details: errors.array()
            })
        }

        const { amount = 10, category, difficulty, type = 'multiple' } = req.query

        // Build API URL with parameters
        let apiUrl = `${OPENTDB_API}?amount=${amount}&type=${type}`

        if (category) apiUrl += `&category=${category}`
        if (difficulty) apiUrl += `&difficulty=${difficulty}`

        console.log('Fetching from:', apiUrl)

        const response = await axios.get(apiUrl)
        const data = response.data

        if (data.response_code === 0) {
            // Success
            res.json({
                success: true,
                results: data.results,
                total: data.results.length
            })
        } else {
            // Handle different response codes
            let errorMessage = 'Unknown error occurred'
            switch (data.response_code) {
                case 1:
                    errorMessage = 'No Results: Could not return results. The API does not have enough questions for your query.'
                    break
                case 2:
                    errorMessage = 'Invalid Parameter: Contains an invalid parameter. Arguments passed are not valid.'
                    break
                case 3:
                    errorMessage = 'Token Not Found: Session Token does not exist.'
                    break
                case 4:
                    errorMessage = 'Token Empty: Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.'
                    break
            }
            res.status(400).json({
                success: false,
                error: errorMessage,
                response_code: data.response_code
            })
        }
    } catch (error) {
        console.error('Error fetching questions:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch questions from OpenTDB'
        })
    }
}

// Get available categories from OpenTDB
const getCategories = async (req, res) => {
    try {
        const response = await axios.get(OPENTDB_CATEGORIES_API)
        res.json({
            success: true,
            categories: response.data.trivia_categories
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories from OpenTDB'
        })
    }
}

// Submit quiz answers and calculate score
const submitQuiz = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission data',
                details: errors.array()
            })
        }

        const { answers, questions } = req.body

        if (!answers || !questions || answers.length !== questions.length) {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission: answers and questions arrays must match in length'
            })
        }

        let correct = 0
        const results = []

        questions.forEach((question, index) => {
            const userAnswer = answers[index]
            const isCorrect = userAnswer === question.correct_answer

            if (isCorrect) correct++

            results.push({
                question: question.question,
                userAnswer,
                correctAnswer: question.correct_answer,
                correct: isCorrect
            })
        })

        const score = Math.round((correct / questions.length) * 100)

        res.json({
            success: true,
            score,
            percentage: score,
            correct,
            total: questions.length,
            results
        })
    } catch (error) {
        console.error('Error processing submission:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to process quiz submission'
        })
    }
}

module.exports = {
    getQuestions,
    getCategories,
    submitQuiz
}