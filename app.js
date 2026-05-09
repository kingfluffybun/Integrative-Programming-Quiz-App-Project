require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const session = require('express-session');
// For Development
const os = require('os');

const MySQLStore = require('express-mysql-session')(session);
const quizRoutes = require('./routes/quiz')
const pagesRoutes = require('./routes/pages')
const authRoutes = require('./routes/auth')
const db = require('./database/connection');


const app = express()
const PORT = process.env.PORT || 3000

// Set up EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', './views')

// Middleware
app.use(morgan('combined'))
// For Development
app.use(helmet({
    contentSecurityPolicy: false, // Relaxed for local development/IP access
}))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Session configuration
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(session({
    key: 'quiz_app_session',
    secret: process.env.SESSION_SECRET || 'secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Make user info available in all templates
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const [users] = await db.query('SELECT username, coins FROM users WHERE id = ?', [req.session.userId]);
            if (users.length > 0) {
                res.locals.user = {
                    id: req.session.userId,
                    username: users[0].username,
                    coins: users[0].coins
                };
            } else {
                res.locals.user = null;
            }
        } catch (error) {
            console.error('Error fetching user data for locals:', error);
            res.locals.user = { id: req.session.userId, username: req.session.username, coins: 0 };
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// Routes
app.use('/auth', authRoutes)
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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

module.exports = app