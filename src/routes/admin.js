const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const xeroxController = require('../controllers/xerox');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Protect all routes with authentication and admin access
router.use(isAuthenticated, isAdmin);

// @route   GET /admin/services
// @desc    Get admin services page
// @access  Private/Admin
router.get('/services', (req, res) => {
    res.render('admin/services', {
        title: 'Manage Services'
    });
});

// @route   GET /admin/services/add
// @desc    Get add service page
// @access  Private/Admin
router.get('/services/add', (req, res) => {
    res.render('admin/add-service', {
        title: 'Add Service'
    });
});

// @route   GET /admin/services/edit/:id
// @desc    Get edit service page
// @access  Private/Admin
router.get('/services/edit/:id', async(req, res) => {
    try {
        const service = await XeroxService.findById(req.params.id);

        if (!service) {
            req.flash('error_msg', 'Service not found');
            return res.redirect('/admin/services');
        }

        res.render('admin/edit-service', {
            title: 'Edit Service',
            service
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.redirect('/admin/services');
    }
});

// @route   GET /admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async(req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('orderItems.service');

        res.render('admin/orders', {
            title: 'All Orders',
            orders
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.redirect('/admin/dashboard');
    }
});

// @route   GET /admin/orders/:id
// @desc    Get single order
// @access  Private/Admin
router.get('/orders/:id', async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone address')
            .populate('orderItems.service');

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/admin/orders');
        }

        res.render('admin/order-details', {
            title: `Order #${order._id}`,
            order
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.redirect('/admin/orders');
    }
});

// @route   PUT /admin/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id', [
    check('status', 'Status is required').not().isEmpty()
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, trackingNumber, estimatedDeliveryDate } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

        // If status is delivered, update delivery info
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /admin/dashboard
// @desc    Get admin dashboard
// @access  Private/Admin
router.get('/dashboard', async(req, res) => {
    try {
        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        // Get recent orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('orderItems.service');

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: {
                totalOrders,
                pendingOrders,
                processingOrders,
                completedOrders
            },
            recentOrders
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: {
                totalOrders: 0,
                pendingOrders: 0,
                processingOrders: 0,
                completedOrders: 0
            },
            recentOrders: []
        });
    }
});

module.exports = router;