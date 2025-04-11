const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Get user dashboard
// @route   GET /user/dashboard
// @access  Private
exports.getDashboard = async(req, res) => {
    try {
        const userId = req.session.user.id;

        // Get recent orders
        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('orderItems.service');

        // Get user profile
        const user = await User.findById(userId).select('-password');

        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/auth/login');
        }

        res.render('user/dashboard', {
            title: 'Dashboard',
            user,
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private
exports.getProfile = async(req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/auth/login');
        }

        res.render('user/profile', {
            title: 'My Profile',
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error_msg', 'Failed to load profile');
        res.redirect('/user/dashboard');
    }
};

// @desc    Update user profile
// @route   PUT /user/profile
// @access  Private
exports.updateProfile = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.session.user.id;
        const { name, email, phone, street, city, state, zipCode, country } = req.body;

        // Check if email is taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                req.flash('error_msg', 'Email already in use');
                return res.redirect('/user/profile');
            }
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                name,
                email,
                phone,
                address: {
                    street,
                    city,
                    state,
                    zipCode,
                    country
                }
            }, { new: true, runValidators: true }
        ).select('-password');

        // Update session data
        req.session.user = {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        };

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                data: updatedUser
            });
        }

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/user/profile');
    }
};

// @desc    Change password
// @route   PUT /user/change-password
// @access  Private
exports.changePassword = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.session.user.id;
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/auth/login');
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            req.flash('error_msg', 'Current password is incorrect');
            return res.redirect('/user/profile');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });
        }

        req.flash('success_msg', 'Password updated successfully');
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Password change error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to update password');
        res.redirect('/user/profile');
    }
};

// @desc    Get user orders
// @route   GET /user/orders
// @access  Private
exports.getOrders = async(req, res) => {
    try {
        const userId = req.session.user.id;
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('orderItems.service');

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                count: orders.length,
                data: orders
            });
        }

        res.render('user/orders', {
            title: 'My Orders',
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to fetch orders');
        res.redirect('/user/dashboard');
    }
};

// @desc    Get single order
// @route   GET /user/orders/:id
// @access  Private
exports.getOrderById = async(req, res) => {
    try {
        const userId = req.session.user.id;
        const order = await Order.findOne({ _id: req.params.id, user: userId })
            .populate('orderItems.service');

        if (!order) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            req.flash('error_msg', 'Order not found');
            return res.redirect('/user/orders');
        }

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                data: order
            });
        }

        res.render('user/order-details', {
            title: `Order #${order._id}`,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to fetch order details');
        res.redirect('/user/orders');
    }
};

// @desc    Get user cart
// @route   GET /user/cart
// @access  Private
exports.getCart = async(req, res) => {
    try {
        const userId = req.session.user.id;
        let cart = await Cart.findOne({ user: userId }).populate('items.service');

        if (!cart) {
            cart = {
                items: [],
                totalPrice: 0
            };
        }

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                data: cart
            });
        }

        res.render('user/cart', {
            title: 'My Cart',
            cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to fetch cart');
        res.redirect('/user/dashboard');
    }
};

// @desc    Update cart item
// @route   PUT /user/cart/:itemId
// @access  Private
exports.updateCartItem = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.session.user.id;
        const { quantity, pageCount, options, notes } = req.body;

        // Find cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find cart item
        const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Update item
        if (quantity) cart.items[itemIndex].quantity = parseInt(quantity);
        if (pageCount) cart.items[itemIndex].pageCount = parseInt(pageCount);

        if (options) {
            let parsedOptions = [];

            if (typeof options === 'string') {
                try {
                    parsedOptions = JSON.parse(options);
                } catch (e) {
                    console.error('Error parsing options:', e);
                }
            } else if (Array.isArray(options)) {
                parsedOptions = options;
            }

            cart.items[itemIndex].options = parsedOptions;
        }

        if (notes !== undefined) cart.items[itemIndex].notes = notes;

        // Save cart
        await cart.save();

        // Return updated cart
        cart = await Cart.findById(cart._id).populate('items.service');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /user/cart/:itemId
// @access  Private
exports.removeCartItem = async(req, res) => {
    try {
        const userId = req.session.user.id;

        // Find cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove item
        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

        // Save cart
        await cart.save();

        // Return updated cart
        cart = await Cart.findById(cart._id).populate('items.service');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};