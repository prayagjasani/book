const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const xeroxController = require('../controllers/xerox');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadPdf, uploadImage } = require('../middleware/upload');

// @route   GET /xerox
// @desc    Get all xerox services
// @access  Public
router.get('/', xeroxController.getAllServices);

// @route   GET /xerox/:id
// @desc    Get single xerox service
// @access  Public
router.get('/:id', xeroxController.getServiceById);

// @route   POST /xerox
// @desc    Create a new xerox service
// @access  Private/Admin
router.post(
    '/',
    isAuthenticated,
    isAdmin,
    uploadImage.single('image'), [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required and must be a number').isNumeric(),
        check('category', 'Category is required').not().isEmpty()
    ],
    xeroxController.createService
);

// @route   PUT /xerox/:id
// @desc    Update a xerox service
// @access  Private/Admin
router.put(
    '/:id',
    isAuthenticated,
    isAdmin,
    uploadImage.single('image'), [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required and must be a number').isNumeric(),
        check('category', 'Category is required').not().isEmpty()
    ],
    xeroxController.updateService
);

// @route   DELETE /xerox/:id
// @desc    Delete a xerox service
// @access  Private/Admin
router.delete('/:id', isAuthenticated, isAdmin, xeroxController.deleteService);

// @route   POST /xerox/upload
// @desc    Upload a PDF file
// @access  Private
router.post('/upload', isAuthenticated, uploadPdf.single('pdf'), xeroxController.uploadPdf);

// @route   POST /xerox/cart
// @desc    Add a xerox service to cart
// @access  Private
router.post(
    '/cart',
    isAuthenticated, [
        check('serviceId', 'Service ID is required').not().isEmpty(),
        check('quantity', 'Quantity must be a number').optional().isNumeric(),
        check('pageCount', 'Page count must be a number').optional().isNumeric()
    ],
    xeroxController.addToCart
);

module.exports = router;