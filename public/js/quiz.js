// Quiz Application Frontend JavaScript
let currentQuestions = []
let userAnswers = []
let currentQuestionIndex = 0

// Function to decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function loadCategories() {
  try {
    const response = await fetch("/api/quiz/categories")
    const data = await response.json()
    if (data.success) {
      const categorySelect = document.getElementById("category")
      data.categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        categorySelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

async function getQuestions() {
  const amount = document.getElementById("amount").value
  const category = document.getElementById("category").value
  const difficulty = document.getElementById("difficulty").value

  const container = document.getElementById("quiz-container")
  container.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Fetching questions from OpenTDB...</div></div>'

  // Disable the start button during loading
  const startButton = document.querySelector('button[onclick="getQuestions()"]')
  if (startButton) startButton.disabled = true

  try {
    let url = `/api/quiz/questions?amount=${amount}`
    if (category) url += `&category=${category}`
    if (difficulty) url += `&difficulty=${difficulty}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.success) {
      currentQuestions = data.results
      userAnswers = new Array(data.results.length).fill(null)
      displayQuestions(data.results)
    } else {
      container.innerHTML = `<div class="error">Error: ${data.error}</div>`
    }
  } catch (error) {
    console.error("Error fetching questions:", error)
    container.innerHTML =
      '<div class="error">Failed to load questions. Please try again.</div>'
  } finally {
    // Re-enable the start button after loading completes
    if (startButton) startButton.disabled = false
  }
}

function displayQuestions(questions) {
  currentQuestionIndex = 0
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  // Shuffle answers for each question and store them
  questions.forEach((question) => {
    const answers = [
      ...question.incorrect_answers,
      question.correct_answer,
    ]
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[answers[i], answers[j]] = [answers[j], answers[i]]
    }
    question.shuffledAnswers = answers
  })

  showQuestion(currentQuestionIndex)
}

function showQuestion(index) {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  const question = currentQuestions[index]
  const questionDiv = document.createElement("div")
  questionDiv.className = "question"

  const progressText = document.createElement("p")
  progressText.className = "progress-text"
  progressText.style.textAlign = "center"
  progressText.style.color = "#666"
  progressText.style.marginBottom = "20px"
  progressText.innerHTML = `Question ${index + 1} of ${currentQuestions.length}`
  container.appendChild(progressText)

  questionDiv.innerHTML = `
    <h3>${decodeHtml(question.question)}</h3>
    <div class="question-info">
        <span><strong>Category:</strong> ${question.category}</span>
        <span><strong>Difficulty:</strong> ${question.difficulty}</span>
        <span><strong>Type:</strong> ${question.type}</span>
    </div>
    <div class="answers">
        ${question.shuffledAnswers
          .map(
            (answer) => {
              const isChecked = userAnswers[index] === answer ? 'checked' : ''
              return `<label class="answer-option">
                <input type="radio" name="question-${index}" value="${answer}" ${isChecked}>
                ${decodeHtml(answer)}
            </label>`
            }
          )
          .join("")}
    </div>
  `
  container.appendChild(questionDiv)

  // Add navigation buttons
  const navContainer = document.createElement("div")
  navContainer.style.display = "flex"
  navContainer.style.justifyContent = "space-between"
  navContainer.style.marginTop = "20px"
  navContainer.style.gap = "10px"

  const prevBtn = document.createElement("button")
  prevBtn.textContent = index > 0 ? "Previous" : "Previous"
  prevBtn.disabled = index === 0
  prevBtn.style.background = index === 0 ? "#ccc" : "#6c757d"
  prevBtn.style.color = "#fff"
  prevBtn.style.padding = "10px 20px"
  prevBtn.style.border = "none"
  prevBtn.style.borderRadius = "5px"
  prevBtn.style.cursor = index === 0 ? "not-allowed" : "pointer"
  prevBtn.onclick = () => {
    if (index > 0) {
      saveCurrentAnswer()
      showQuestion(index - 1)
    }
  }

  const nextBtn = document.createElement("button")
  if (index < currentQuestions.length - 1) {
    nextBtn.textContent = "Next"
    nextBtn.style.background = "#007bff"
  } else {
    nextBtn.textContent = "Submit Quiz"
    nextBtn.style.background = "#28a745"
  }
  nextBtn.style.color = "#fff"
  nextBtn.style.padding = "10px 20px"
  nextBtn.style.border = "none"
  nextBtn.style.borderRadius = "5px"
  nextBtn.style.cursor = "pointer"
  nextBtn.onclick = () => {
    saveCurrentAnswer()
    if (index < currentQuestions.length - 1) {
      showQuestion(index + 1)
    } else {
      submitQuiz()
    }
  }

  navContainer.appendChild(prevBtn)
  navContainer.appendChild(nextBtn)
  container.appendChild(navContainer)

  // Add event listeners for radio buttons
  const radioButtons = container.querySelectorAll('input[type="radio"]')
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      const answer = this.value
      selectAnswer(index, answer)
    })
  })
}

function saveCurrentAnswer() {
  const selectedRadio = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`)
  if (selectedRadio) {
    userAnswers[currentQuestionIndex] = selectedRadio.value
  }
}

function selectAnswer(index, answer) {
  userAnswers[index] = answer
}

function submitQuiz() {
  // Check if all questions are answered
  if (userAnswers.some(answer => answer === null)) {
    alert("Please answer all questions before submitting.")
    return
  }

  fetch("/api/quiz/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answers: userAnswers,
      questions: currentQuestions,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayResults(data)
      } else {
        alert("Error submitting quiz: " + data.error)
      }
    })
    .catch((error) => {
      console.error("Error submitting quiz:", error)
      alert("Failed to submit quiz. Please try again.")
    })
}

function displayResults(data) {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  const scoreDiv = document.createElement("div")
  scoreDiv.className = "score-display"
  scoreDiv.innerHTML = `
        <h2>Quiz Results</h2>
        <p>You scored ${data.correct} out of ${data.total} (${data.percentage}%)</p>
    `
  container.appendChild(scoreDiv)

  data.results.forEach((result, index) => {
    console.log(`Question ${index + 1}:`, result.correct, typeof result.correct)
    const resultDiv = document.createElement("div")
    resultDiv.className = `result ${result.correct ? "correct" : "incorrect"}`
    resultDiv.innerHTML = `
            <h4>Question ${index + 1}: ${decodeHtml(result.question)}</h4>
            <p><strong>Your answer:</strong> ${decodeHtml(result.userAnswer)}</p>
            <p><strong>Correct answer:</strong> ${decodeHtml(result.correctAnswer)}</p>
        `
    container.appendChild(resultDiv)
  })

  // Add reset button
  const resetButton = document.createElement("button")
  resetButton.textContent = "Take Another Quiz"
  resetButton.id = "reset-results-btn"
  resetButton.style.background = "#007bff"
  resetButton.style.marginTop = "20px"
  container.appendChild(resetButton)

  // Add event listener for reset button
  resetButton.addEventListener('click', resetQuiz)
}

function resetQuiz() {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""
  currentQuestions = []
  userAnswers = []
}

// Load categories on page load
document.addEventListener("DOMContentLoaded", function() {
  loadCategories()
  // Add event listeners for buttons
  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')
  
  if (startBtn) startBtn.addEventListener('click', getQuestions)
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)
})

// Also call immediately in case DOMContentLoaded has already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadCategories()
    // Add event listeners for buttons
    const startBtn = document.getElementById('start-quiz-btn')
    const resetBtn = document.getElementById('reset-quiz-btn')
    
    if (startBtn) startBtn.addEventListener('click', getQuestions)
    if (resetBtn) resetBtn.addEventListener('click', resetQuiz)
  })
} else {
  loadCategories()
  // Add event listeners for buttons
  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')
  
  if (startBtn) startBtn.addEventListener('click', getQuestions)
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)
}