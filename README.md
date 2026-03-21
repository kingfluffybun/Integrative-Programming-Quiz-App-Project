# Express Quiz App

A simple quiz application built with Express.js that fetches trivia questions from the Open Trivia Database (OpenTDB).

## Features

- Fetch random trivia questions from OpenTDB API
- Support for different categories, difficulties, and question types
- Simple web interface for testing
- API endpoints for quiz functionality
- Score calculation for submitted answers

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3001 (or the PORT environment variable).

## Project Structure

```
express-quiz_app/
├── controllers/
│   ├── quizController.js    # Backend business logic for quiz operations
│   └── quiz.js              # Quiz controller (legacy/backup)
├── routes/
│   ├── quiz.js              # API routes for quiz endpoints
│   └── pages.js             # Routes for static pages (home, start, about, quiz)
├── views/
│   ├── index.ejs            # Home page template
│   ├── quiz.ejs             # Quiz interface template
│   └── about.ejs            # About page template
├── public/
│   ├── css/
│   │   └── styles.css       # Application styles (responsive design)
│   └── js/
│       └── quiz.js          # Frontend quiz interaction logic
├── tests/
│   └── quiz.test.js         # Test suite for quiz functionality
├── app.js                   # Main application server file
├── package.json             # Project dependencies and scripts
├── .gitignore               # Git ignore file for node_modules, env files, etc.
└── README.md                # Project documentation
```

## API Endpoints

### GET /api/quiz/questions
Fetch quiz questions from OpenTDB.

Query parameters:

- `amount`: Number of questions (default: 10, max: 50)
- `category`: Category ID (see categories endpoint)
- `difficulty`: easy/medium/hard
- `type`: multiple/boolean (default: multiple)

Example: `/api/quiz/questions?amount=5&difficulty=easy`

### GET /api/quiz/categories
Get list of available trivia categories.

### POST /api/quiz/submit
Submit quiz answers for scoring.

Body:
```json
{
  "answers": ["Answer 1", "Answer 2", ...],
  "questions": [
    {
      "question": "Question text",
      "correct_answer": "Correct answer"
    }
  ]
}
```

## OpenTDB API

This app uses the [Open Trivia Database API](https://opentdb.com/api_config.php) which provides free trivia questions.

## Technologies Used

- Express.js
- Axios for HTTP requests
- OpenTDB API for trivia questions

## License

ISC