const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/user');
const { isAuthenticated } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Protect all routes
router.use(isAuthenticated);

// @route   GET /user/dashboard
// @desc    Get user dashboard
// @access  Private
router.get('/dashboard', userController.getDashboard);

// @route   GET /user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', userController.getProfile);

// @route   PUT /user/profile
// @desc    Update user profile
// @access  Private
router.put(
    '/profile', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail()
    ],
    userController.updateProfile
);

// @route   PUT /user/change-password
// @desc    Change user password
// @access  Private
router.put(
    '/change-password', [
        check('currentPassword', 'Current password is required').not().isEmpty(),
        check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    userController.changePassword
);

// @route   GET /user/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', userController.getOrders);

// @route   GET /user/orders/:id
// @desc    Get single order
// @access  Private
router.get('/orders/:id', userController.getOrderById);

// @route   GET /user/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', userController.getCart);

// @route   PUT /user/cart/:itemId
// @desc    Update cart item
// @access  Private
router.put(
    '/cart/:itemId', [
        check('quantity', 'Quantity must be a number').optional().isNumeric(),
        check('pageCount', 'Page count must be a number').optional().isNumeric()
    ],
    userController.updateCartItem
);

// @route   DELETE /user/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', userController.removeCartItem);

module.exports = router;