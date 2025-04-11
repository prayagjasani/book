const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /auth/register
// @desc    Render register page
// @access  Public
router.get('/register', authController.getRegisterPage);

// @route   GET /auth/login
// @desc    Render login page
// @access  Public
router.get('/login', authController.getLoginPage);

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    authController.register
);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post(
    '/login', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    authController.login
);

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', isAuthenticated, authController.logout);

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', isAuthenticated, authController.getCurrentUser);

module.exports = router;