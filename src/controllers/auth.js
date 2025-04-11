const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
exports.register = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            req.flash('error_msg', 'User with this email already exists');
            return res.status(400).render('auth/register', {
                error: 'User with this email already exists',
                name,
                email,
                phone
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Create token
        const token = generateToken(user._id, user.role);

        // Save user in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        req.session.token = token;

        // Handle API response
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // Redirect to dashboard for web interface
        req.flash('success_msg', 'Registration successful! You are now logged in.');
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Registration error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.status(500).render('auth/register', {
            error: 'Registration failed. Please try again.',
            ...req.body
        });
    }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            req.flash('error_msg', 'Invalid email or password');
            return res.status(401).render('auth/login', { email });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            req.flash('error_msg', 'Invalid email or password');
            return res.status(401).render('auth/login', { email });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Save user in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        req.session.token = token;

        // Handle API response
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // Redirect based on role
        req.flash('success_msg', 'You are now logged in');
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
        req.flash('error_msg', 'Login failed. Please try again.');
        res.status(500).render('auth/login', { email: req.body.email });
    }
};

// @desc    Logout user
// @route   GET /auth/logout
// @access  Private
exports.logout = (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');

    if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }

    res.redirect('/auth/login');
};

// @desc    Get register page
// @route   GET /auth/register
// @access  Public
exports.getRegisterPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/register');
};

// @desc    Get login page
// @route   GET /auth/login
// @access  Public
exports.getLoginPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login');
};

// @desc    Get current user profile
// @route   GET /auth/me
// @access  Private
exports.getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.session.user.id || req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};