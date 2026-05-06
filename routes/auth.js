const express = require('express');
const { body } = require('express-validator');
const { login, register, logout } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], register);

// Login route
router.post('/login', [
    body('identifier').notEmpty().withMessage('Username or Email is required'),
    body('password').notEmpty().withMessage('Password is required')
], login);

// Logout route
router.get('/logout', logout);

module.exports = router;
