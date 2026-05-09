const express = require('express')
const router = express.Router()
const { getProfile, updateProfile } = require('../controllers/profileController')
const { purchaseTheme, getShop } = require('../controllers/shopController')


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
router.get('/shop', getShop)
router.post('/shop/purchase', purchaseTheme)

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
    data: {},
    step: 1
  })
})

// Profile Page
router.get('/profile', getProfile)
router.post('/profile/update', updateProfile)

module.exports = router
