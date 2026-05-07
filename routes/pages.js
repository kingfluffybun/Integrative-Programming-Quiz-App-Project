const express = require('express')
const router = express.Router()
const { getProfile, updateProfile } = require('../controllers/profileController')

// Home page (static info about the app using OpenTDB)
router.get('/', (req, res) => {
  res.render('index', { title: 'Home - Express Quiz App' })
})

// About page (info about Express.js application)
router.get('/about', (req, res) => {
  res.render('about', { title: 'About - Express Quiz App' })
})

// Default route: redirect to home page
router.get('/quiz', (req, res) => {
  res.render('quiz', { title: 'Quiz - Express Quiz App' })
})

// Shop page
router.get('/shop', (req, res) => {
  res.render('shop', { title: 'Quiz - Express Quiz App' })
})

// Login page
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - Express Quiz App',
    message: null,
    errors: [],
    data: {}
  })
})

// Register Page
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register - Express Quiz App',
    message: null,
    errors: [],
    data: {}
  })
})

// Recovery Page
router.get('/recovery', (req, res) => {
  res.render('recovery', {
    title: 'Recovery - Express Quiz App',
    message: null,
    errors: [],
    data: {}
  })
})

// Profile Page
router.get('/profile', getProfile)
router.post('/profile/update', updateProfile)

module.exports = router
