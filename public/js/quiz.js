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
  const category = 32;
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
    const cont = document.querySelector(".container")
    const main = document.querySelector(".main")
    container.innerHTML = ""

    const existingNav = main.querySelector('.nav-container')
    if (existingNav) existingNav.remove()

    const question = currentQuestions[index]
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"

    const progressText = `Question ${index + 1} of ${currentQuestions.length}`

    const quizControl = document.createElement("div")
    quizControl.className = "quiz-control"
    quizControl.innerHTML = `
        <div style="display: flex; gap: 8px;">
            <button id="quit-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <p style="text-align: center; font-family: FeatherBold">${progressText}</p>
        <div style="display: flex; justify-content: flex-end; align-items:center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"/></svg>
            <p style="font-family: FeatherBold">1000</p>
        </div>
    `

    quizControl.querySelector('#quit-btn').addEventListener('click', resetQuiz)

    const progressPercentage = ((index) / currentQuestions.length) * 100
    const persistentHeader = document.getElementById("quiz-persistent-header")
    persistentHeader.style.cssText = "display: flex; flex-direction: column; gap: 8px;"

    const existingQuizControl = persistentHeader.querySelector(".quiz-control")
    if (existingQuizControl) existingQuizControl.remove()
    
    persistentHeader.prepend(quizControl)

    let fill = persistentHeader.querySelector(".progress-bar-fill")

    if (!fill) {
        const progression = document.createElement("div")
        progression.className = "progression"
        progression.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-bottom:20px;"
        progression.innerHTML = `
            <div class="progress-bar" style="width:100%;height:16px;background-color:#e0e0e0;border-radius:16px;overflow:hidden;">
                <div class="progress-bar-fill" style="width:0%;height:100%;background-color:#4CAF50;transition:width 250ms ease;"></div>
            </div>
        `
        persistentHeader.appendChild(progression)
        fill = persistentHeader.querySelector(".progress-bar-fill")
    }

    requestAnimationFrame(() => {
        fill.style.width = `${progressPercentage}%`
    })
    
  questionDiv.innerHTML = `<h2>${decodeHtml(question.question)}</h2>`
    // <div class="question-info">
    //     <span><strong>Category:</strong> ${question.category}</span>
    //     <span><strong>Difficulty:</strong> ${question.difficulty}</span>
    //     <span><strong>Type:</strong> ${question.type}</span>
    // </div>

    const answers = document.createElement("div")
    answers.classList.add("answers")
    answers.innerHTML = `
    ${question.shuffledAnswers
          .map(
            (answer) => {
              const isChecked = userAnswers[index] === answer ? 'checked' : ''
              return `<label class="answer-option">
                <input type="radio" name="question-${index}" value="${answer}" ${isChecked}>
                <div class="answer-option-content">
                    <p>${decodeHtml(answer)}</p>
                </div>
            </label>`
            }
          )
          .join("")}
    `

  container.appendChild(questionDiv)
  container.appendChild(answers)

  // Add navigation buttons
  const navContainer = document.createElement("div")
  navContainer.className = "nav-container"

  const prevBtn = document.createElement("button")
  prevBtn.className = "prevBtn";
  prevBtn.textContent = index > 0 ? "Previous" : "Previous"
  prevBtn.disabled = index === 0
  prevBtn.style.background = index === 0 ? "#ccc" : "#6c757d"
  prevBtn.style.cursor = index === 0 ? "not-allowed" : "pointer"
  prevBtn.onclick = () => {
    if (index > 0) {
      saveCurrentAnswer()
      showQuestion(index - 1)
    }
  }

  const nextBtn = document.createElement("button")
  nextBtn.className = "nextBtn";
  if (index < currentQuestions.length - 1) {
    nextBtn.textContent = "Next"
    nextBtn.style.background = "currentColor"
  } else {
    nextBtn.textContent = "Submit Quiz"
    nextBtn.style.background = "#28a745"
  }
  nextBtn.style.cursor = "pointer";
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
  cont.appendChild(navContainer)

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

  const navContainer = document.querySelector('.nav-container')
  navContainer.style.display = "none";

  const fill = document.querySelector(".progress-bar-fill")
  if (fill) {
    requestAnimationFrame(() => {
      fill.style.width = "100%"
    })
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
  document.getElementById("quiz-persistent-header").innerHTML = ""
  currentQuestions = []
  userAnswers = []
  document.querySelector('.quiz-configuration').style.display = "block";
  const navContainer = document.querySelector('.nav-container')
  navContainer.style.display = "none";
}

// Load categories and setup event listeners on page load
document.addEventListener("DOMContentLoaded", function() {
  loadCategories()

  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')

  if (startBtn) startBtn.addEventListener('click', function() {
    getQuestions()
    document.querySelector('.quiz-configuration').style.display = "none";
  })
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)
})