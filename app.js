require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const quizRoutes = require('./routes/quiz')
const pagesRoutes = require('./routes/pages')

const app = express()
const PORT = process.env.PORT || 3000

// Set up EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', './views')

// Middleware
app.use(morgan('combined'))
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Routes
app.use('/api/quiz', quizRoutes)
app.use('/', pagesRoutes)

// Error handling middleware
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(`Error ${err.status || 500}: ${err.message}`);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

module.exports = app