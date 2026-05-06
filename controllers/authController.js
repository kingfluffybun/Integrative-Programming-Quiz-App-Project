const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Register a new user
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', {
                title: 'Register - Express Quiz App',
                message: null,
                errors: errors.array(),
                data: req.body
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.render('register', {
                title: 'Register - Express Quiz App',
                message: null,
                errors: [{ msg: 'Username or Email already exists' }],
                data: req.body
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.render('login', {
            title: 'Login - Express Quiz App',
            message: 'Registration successful! Please login.',
            errors: [],
            data: {}
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('register', {
            title: 'Register - Express Quiz App',
            message: null,
            errors: [{ msg: 'Server error during registration' }],
            data: req.body
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', {
                title: 'Login - Express Quiz App',
                message: null,
                errors: errors.array(),
                data: req.body
            });
        }

        const { identifier, password } = req.body; // identifier can be email or username

        // Find user
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.render('login', {
                title: 'Login - Express Quiz App',
                message: null,
                errors: [{ msg: 'Invalid credentials' }],
                data: req.body
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                title: 'Login - Express Quiz App',
                message: null,
                errors: [{ msg: 'Invalid credentials' }],
                data: req.body
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.redirect('/quiz');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', {
            title: 'Login - Express Quiz App',
            message: null,
            errors: [{ msg: 'Server error during login' }],
            data: req.body
        });
    }
};

// Logout user
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

module.exports = {
    register,
    login,
    logout
};
