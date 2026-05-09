// Quiz Application Frontend JavaScript
let currentQuestions = []
let userAnswers = []
let currentQuestionIndex = 0
let totalScore = 0

// Difficulty score mapping
const difficultyScores = {
  'easy': 100,
  'medium': 250,
  'hard': 500
}

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
    const selectedAmount = document.querySelector('input[name="length"]:checked');
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    
    if (!selectedAmount || !selectedDifficulty) {
        return;
    }

    const amount = parseInt(selectedAmount.value);
    const category = 32;
    const difficulty = selectedDifficulty.value

    const container = document.getElementById("quiz-container")
    container.style.display = "flex"
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Fetching questions from OpenTDB...</div></div>'

    // Disable the start button during loading
    const startButton = document.getElementById("start-quiz-btn")
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
  totalScore = 0
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  if (window.matchMedia('(max-width: 700px)').matches) {
  document.body.style.cssText = "grid-template-rows: 1fr; grid-template-areas: 'main';"
  document.querySelector('.site-header').style.display = "none";
  }

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

    const direction = index > currentQuestionIndex ? 1 : -1
    currentQuestionIndex = index

    // Slide out current content
    container.style.animation = "none"
    container.style.opacity = "1"
    container.animate(
        [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: `translateX(${direction * -40}px)` }
        ],
        { duration: 200, easing: "ease", fill: "forwards" }
    ).onfinish = () => {
        // Build new question content here
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
                <p style="font-family: FeatherBold; margin: 0;" id="score-display">${totalScore}</p>
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
                <div class="progress-bar" style="width:100%;height:16px;background-color:#e5e5e5;border-radius:16px;overflow:hidden;">
                    <div class="progress-bar-fill" style="width:0%;height:100%;background-color:#4CAF50;transition:width 250ms ease;"></div>
                </div>
            `
            persistentHeader.appendChild(progression)
            fill = persistentHeader.querySelector(".progress-bar-fill")
        }

        requestAnimationFrame(() => {
            fill.style.width = `${progressPercentage}%`
        })
        
        const currentDifficulty = question.difficulty
        const displayDifficulty = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)
        questionDiv.innerHTML = `<h2>${decodeHtml(question.question)}</h2>`

        // <div class="question-info">
        //     <span><strong>Difficulty:</strong> ${displayDifficulty}</span>
        // </div>
        // <span><strong>Category:</strong> ${question.category}</span>
        // <span><strong>Type:</strong> ${question.type}</span>

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
                        <div id="correct" style="display: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg></div>
                        <div id="incorrect" style="display: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
                        <audio src="/sound/correct-answer-alert1.mp3" id="correct-sound">
                        <audio src="/sound/incorrect-answer-alert1.mp3" id="incorrect-sound">
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
        prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-back-icon lucide-step-back"><path d="M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z"/><path d="M21 20V4"/></svg><p>Previous</p>`
        prevBtn.disabled = index === 0
        prevBtn.style.color = index === 0 ? "white" : ""
        prevBtn.style.background = index === 0 ? "#6c757d" : ""
        prevBtn.style.cursor = index === 0 ? "not-allowed" : "pointer"
        prevBtn.onclick = () => {
            if (index > 0) {
            saveCurrentAnswer()
            showQuestion(index - 1)
            }
        }

        const nextBtn = document.createElement("button")
        nextBtn.className = "nextBtn";
        nextBtn.id = `action-btn-${index}`;
        let isAnswerChecked = false
        
        if (index < currentQuestions.length - 1) {
            nextBtn.innerHTML = `<p>Check</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`
            nextBtn.style.background = ""
        } else {
            nextBtn.innerHTML = `<p>Check</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`
            nextBtn.style.background = ""
        }
        nextBtn.style.cursor = "pointer";
        nextBtn.onclick = () => {
            saveCurrentAnswer()
            if (!isAnswerChecked) {
                // First click - check the answer
                checkAnswer(index)
                // Change button to "Next" or "Submit"
                isAnswerChecked = true
                if (index < currentQuestions.length - 1) {
                    nextBtn.innerHTML = `<p>Next</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-forward-icon lucide-step-forward"><path d="M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/><path d="M3 4v16"/></svg>`
                } else {
                    nextBtn.innerHTML = `<p style="text-wrap:nowrap;">Submit Quiz</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`
                }
            } else {
                // Second click - go to next question or submit
                if (index < currentQuestions.length - 1) {
                    showQuestion(index + 1)
                } else {
                    submitQuiz()
                }
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

        // Slide in new content
        container.animate(
        [
            { opacity: 0, transform: `translateX(${direction * 40}px)` },
            { opacity: 1, transform: "translateX(0)" }
        ],
        { duration: 250, easing: "ease", fill: "forwards" }
        )
    }
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

function checkAnswer(index) {
  const question = currentQuestions[index]
  const correctAnswer = question.correct_answer
  const selectedAnswer = userAnswers[index]
  
  if (!selectedAnswer) {
    alert("Please select an answer first!")
    return false
  }
  
  const radioButtons = document.querySelectorAll(`input[name="question-${index}"]`)
  const isCorrect = selectedAnswer === correctAnswer
  
  // Add points if correct
  if (isCorrect) {
    const difficulty = question.difficulty.toLowerCase()
    const points = difficultyScores[difficulty] || 10
    totalScore += points
    updateScoreDisplay()
  }
  
  radioButtons.forEach((radio) => {
    const label = radio.closest('.answer-option')
    const content = label.querySelector('.answer-option-content')
    
    if (radio.value === selectedAnswer) {
      // Selected answer
      if (isCorrect) {
        // Correct answer - show correct indicator
        const correctIndicator = content.querySelector('#correct')
        const correctSound = content.querySelector('#correct-sound')
        if (correctIndicator) correctIndicator.style.display = 'flex'
        correctSound.play()
      } else {
        // Incorrect answer - show incorrect indicator
        const incorrectIndicator = content.querySelector('#incorrect')
        const incorrectSound = content.querySelector('#incorrect-sound')
        if (incorrectIndicator) incorrectIndicator.style.display = 'flex'
        incorrectSound.play()
      }
    } else if (radio.value === correctAnswer) {
      // Show the correct answer even if not selected
      const correctIndicator = content.querySelector('#correct')
      if (correctIndicator) correctIndicator.style.display = 'flex'
    }
    
    // Disable further selection
    radio.disabled = true
  })
  
  return isCorrect
}

function updateScoreDisplay() {
  const scoreElement = document.getElementById('score-display')
  if (scoreElement) {
    scoreElement.textContent = totalScore
  }
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

  const resultContainer = document.createElement("div")
  resultContainer.className = "result-container"
  container.appendChild(resultContainer)

  data.results.forEach((result, index) => {
    console.log(`Question ${index + 1}:`, result.correct, typeof result.correct)
    const resultDiv = document.createElement("div")
    resultDiv.className = `result ${result.correct ? "correct" : "incorrect"}`
    resultDiv.innerHTML = `
            <h4>Question ${index + 1}: ${decodeHtml(result.question)}</h4>
            <p><strong>Your answer:</strong> ${decodeHtml(result.userAnswer)}</p>
            <p><strong>Correct answer:</strong> ${decodeHtml(result.correctAnswer)}</p>
        `
    resultContainer.appendChild(resultDiv)
  })

  // Add button container
  const buttonContainer = document.createElement("div")
  buttonContainer.style.cssText = "display: flex; gap: 12px; margin-top: 20px;"

  // Add next button to go to leaderboard
  const nextBtn = document.createElement("button")
  nextBtn.textContent = "View Leaderboard"
  nextBtn.id = "leaderboard-btn"
  nextBtn.style.display = "flex"
  nextBtn.style.flexGrow = 1;
  nextBtn.addEventListener('click', () => showLeaderboard(data))
  buttonContainer.appendChild(nextBtn)

  // Add reset button
  const resetButton = document.createElement("button")
  resetButton.textContent = "Take Another Quiz"
  resetButton.id = "reset-results-btn"
  resetButton.style.background = "#6c757d"
  resetButton.addEventListener('click', resetQuiz)

  container.appendChild(buttonContainer)
}

function showLeaderboard() {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  // Leaderboard container template
  const leaderboardDiv = document.createElement("div")
  leaderboardDiv.className = "leaderboard-container"
  leaderboardDiv.id = "leaderboard"
  leaderboardDiv.innerHTML = `
    <div class="leaderboard-header">
      <h2>Leaderboard</h2>
    </div>
    <div>
    <div class="leaderboard-content">
        <div class="top-leaderboard">
            <div class="top-leaderboard-player" id="second"><h2>2nd</h2><p>4000</p></div>
            <div class="top-leaderboard-player" id="first"><h2>1st</h2><p>5000</p></div>
            <div class="top-leaderboard-player" id="third"><h2>3rd</h2><p>3500</p></div>
        </div> <br>
        <div class="leaderboard-player">
            <div class="player-info">
                <div class="leaderboard-position">
                    <h2>4</h2>
                </div>
                <p>Player 4</p>
            </div>
            <p>3000</p>
        </div>
        <div class="leaderboard-player">
            <div class="player-info">
                <div class="leaderboard-position">
                    <h2>5</h2>
                </div>
                <p>Player 5</p>
            </div>
            <p>3000</p>
        </div>
        <div class="leaderboard-player">
            <div class="player-info">
                <div class="leaderboard-position">
                    <h2>6</h2>
                </div>
                <p>Player 6</p>
            </div>
            <p>3000</p>
        </div>
    </div>
  `
  container.appendChild(leaderboardDiv)

  // Add back button
  const buttonContainer = document.createElement("div")
  buttonContainer.style.cssText = "display: flex; gap: 12px; margin-top: 20px;"

  const backBtn = document.createElement("button")
  backBtn.textContent = "Take Another Quiz"
  backBtn.id = "back-btn"
  backBtn.addEventListener('click', resetQuiz)
  buttonContainer.appendChild(backBtn)

  container.appendChild(buttonContainer)
}

function resetQuiz() {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""
  document.getElementById("quiz-persistent-header").innerHTML = ""
  document.getElementById("quiz-persistent-header").style.display = "none"
  currentQuestions = []
  userAnswers = []
  document.querySelector('.quiz-configuration').style.display = "flex";
  const navContainer = document.querySelector('.nav-container')
  navContainer.style.display = "none";
  if (window.matchMedia('(max-width: 700px)').matches) {
    document.body.style.cssText = "grid-template-rows: 1fr auto; grid-template-areas: 'main' 'header';"
    document.querySelector('.site-header').style.display = "flex";
  }
}

// Load categories and setup event listeners on page load
document.addEventListener("DOMContentLoaded", function() {
  loadCategories()

  const length = document.querySelectorAll('input[name="length"]');
  const difficulty = document.querySelectorAll('input[name="difficulty"]');
  const anyDifficulty = document.querySelector('input[name="difficulty"][value=""]');

  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')

  length.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === '50') {
        // Epic selected: auto-select "Any" and disable others
        if (anyDifficulty) anyDifficulty.checked = true;
        difficulty.forEach(diff => {
          if (diff.value !== '') {
            diff.disabled = true;
            const parent = diff.closest('.num-question');
            if (parent) {
                parent.style.opacity = '0.5';
                parent.style.pointerEvents = 'none';
            }
          }
        });
      } else {
        // Other length selected: re-enable all difficulties
        difficulty.forEach(diff => {
          diff.disabled = false;
          const parent = diff.closest('.num-question');
          if (parent) {
              parent.style.opacity = '1';
              parent.style.pointerEvents = 'auto';
          }
        });
      }
    });
  });

  if (startBtn) startBtn.addEventListener('click', function() {
    const selectedAmount = document.querySelector('input[name="length"]:checked');
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    const container = document.querySelector(".errorSelect")

    if (!selectedAmount || !selectedDifficulty) {
        container.style.display = "flex"
        container.innerHTML = '<div class="error"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg><p>Must select both quiz length and difficulty!</p></div>';
        return;
    } else {
        container.innerHTML = '';
    }

    getQuestions()
    document.querySelector('.quiz-configuration').style.display = "none";
    document.querySelector('.errorSelect').style.display = "none";
  })
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)
})