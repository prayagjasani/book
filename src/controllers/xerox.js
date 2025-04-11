const XeroxService = require('../models/XeroxService');
const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// @desc    Get all xerox services
// @route   GET /xerox
// @access  Public
exports.getAllServices = async(req, res) => {
    try {
        const services = await XeroxService.find({ isActive: true });

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                count: services.length,
                data: services
            });
        }

        res.render('xerox/services', {
            title: 'Xerox Services',
            services
        });
    } catch (error) {
        console.error('Get services error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to fetch services');
        res.status(500).render('error', {
            message: 'Failed to fetch services',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// @desc    Get single xerox service
// @route   GET /xerox/:id
// @access  Public
exports.getServiceById = async(req, res) => {
    try {
        const service = await XeroxService.findById(req.params.id);

        if (!service) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }
            req.flash('error_msg', 'Service not found');
            return res.status(404).render('404');
        }

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                data: service
            });
        }

        res.render('xerox/service-details', {
            title: service.name,
            service
        });
    } catch (error) {
        console.error('Get service error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to fetch service details');
        res.status(500).render('error', {
            message: 'Failed to fetch service details',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// @desc    Create a new xerox service (Admin only)
// @route   POST /xerox
// @access  Private/Admin
exports.createService = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/images/${req.file.filename}`;
        }

        const {
            name,
            description,
            price,
            priceUnit,
            category,
            isColor,
            paperSize,
            estimatedTime,
            additionalOptions
        } = req.body;

        // Parse additional options if provided
        let parsedOptions = [];
        if (additionalOptions && typeof additionalOptions === 'string') {
            try {
                parsedOptions = JSON.parse(additionalOptions);
            } catch (e) {
                console.error('Error parsing additionalOptions:', e);
            }
        } else if (Array.isArray(additionalOptions)) {
            parsedOptions = additionalOptions;
        }

        const newService = await XeroxService.create({
            name,
            description,
            price: parseFloat(price),
            priceUnit,
            category,
            isColor: isColor === 'true' || isColor === true,
            paperSize,
            estimatedTime,
            additionalOptions: parsedOptions,
            image: imageUrl
        });

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(201).json({
                success: true,
                data: newService
            });
        }

        req.flash('success_msg', 'Service created successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Create service error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to create service');
        res.status(500).render('admin/add-service', {
            title: 'Add Service',
            formData: req.body,
            error: 'Failed to create service'
        });
    }
};

// @desc    Update a xerox service (Admin only)
// @route   PUT /xerox/:id
// @access  Private/Admin
exports.updateService = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let service = await XeroxService.findById(req.params.id);

        if (!service) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }
            req.flash('error_msg', 'Service not found');
            return res.redirect('/admin/services');
        }

        let imageUrl = service.image;
        if (req.file) {
            // Delete old image if exists
            if (service.image) {
                const oldImagePath = path.join(__dirname, '../public', service.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/images/${req.file.filename}`;
        }

        const {
            name,
            description,
            price,
            priceUnit,
            category,
            isColor,
            paperSize,
            estimatedTime,
            additionalOptions,
            isActive
        } = req.body;

        // Parse additional options if provided
        let parsedOptions = [];
        if (additionalOptions && typeof additionalOptions === 'string') {
            try {
                parsedOptions = JSON.parse(additionalOptions);
            } catch (e) {
                console.error('Error parsing additionalOptions:', e);
            }
        } else if (Array.isArray(additionalOptions)) {
            parsedOptions = additionalOptions;
        }

        service = await XeroxService.findByIdAndUpdate(
            req.params.id, {
                name,
                description,
                price: parseFloat(price),
                priceUnit,
                category,
                isColor: isColor === 'true' || isColor === true,
                paperSize,
                estimatedTime,
                additionalOptions: parsedOptions,
                image: imageUrl,
                isActive: isActive === 'true' || isActive === true
            }, { new: true, runValidators: true }
        );

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                data: service
            });
        }

        req.flash('success_msg', 'Service updated successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Update service error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to update service');
        res.redirect(`/admin/services/edit/${req.params.id}`);
    }
};

// @desc    Delete a xerox service (Admin only)
// @route   DELETE /xerox/:id
// @access  Private/Admin
exports.deleteService = async(req, res) => {
    try {
        const service = await XeroxService.findById(req.params.id);

        if (!service) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }
            req.flash('error_msg', 'Service not found');
            return res.redirect('/admin/services');
        }

        // Delete image if exists
        if (service.image) {
            const imagePath = path.join(__dirname, '../public', service.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await service.remove();

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(200).json({
                success: true,
                message: 'Service deleted successfully'
            });
        }

        req.flash('success_msg', 'Service deleted successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Delete service error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
        req.flash('error_msg', 'Failed to delete service');
        res.redirect('/admin/services');
    }
};

// @desc    Upload a PDF for xerox
// @route   POST /xerox/upload
// @access  Private
exports.uploadPdf = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            });
        }

        const fileUrl = `/uploads/pdfs/${req.file.filename}`;

        // Get page count
        const pdfPath = path.join(__dirname, '../public', fileUrl);

        // Here we would typically use a PDF parsing library to get the page count
        // For simplicity, returning a placeholder
        const pageCount = 1;

        res.status(200).json({
            success: true,
            data: {
                fileUrl,
                fileName: req.file.originalname,
                pageCount
            }
        });
    } catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading PDF'
        });
    }
};

// @desc    Add xerox service to cart
// @route   POST /xerox/cart
// @access  Private
exports.addToCart = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { serviceId, quantity, pageCount, options, notes, uploadedFile } = req.body;
        const userId = req.session.user && req.session.user.id ? req.session.user.id :
            (req.user && req.user.id ? req.user.id : null);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate service
        const service = await XeroxService.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Get or create user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalPrice: 0
            });
        }

        // Calculate item price
        let itemPrice = service.price;
        let parsedOptions = [];

        // Parse options if provided
        if (options && typeof options === 'string') {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                console.error('Error parsing options:', e);
            }
        } else if (Array.isArray(options)) {
            parsedOptions = options;
        }

        // Add new item to cart
        cart.items.push({
            service: serviceId,
            quantity: parseInt(quantity) || 1,
            pageCount: parseInt(pageCount) || 1,
            options: parsedOptions,
            notes,
            uploadedFile,
            price: itemPrice
        });

        // Save cart and recalculate total
        await cart.save();

        // Respond with updated cart
        const populatedCart = await Cart.findById(cart._id).populate('items.service');

        res.status(200).json({
            success: true,
            message: 'Service added to cart',
            data: populatedCart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding service to cart'
        });
    }
};