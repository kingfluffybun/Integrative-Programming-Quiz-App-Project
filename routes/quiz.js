const express = require('express')
const { query, body } = require('express-validator')
const { getQuestions, getCategories, submitQuiz, getLeaderboard } = require('../controllers/quizController')

const router = express.Router()

// Get quiz questions
router.get('/questions', [
    query('amount').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('category').optional().isInt().toInt(),
    query('difficulty').optional().isIn(['easy', 'medium', 'hard'])
], getQuestions)

// Get available categories
router.get('/categories', getCategories)

// Submit quiz answers and calculate score
router.post('/submit', [
    body('answers').isArray(),
    body('questions').isArray()
], submitQuiz)

// Get leaderboard
router.get('/leaderboard', getLeaderboard)

module.exports = router