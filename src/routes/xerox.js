const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const xeroxController = require('../controllers/xerox');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadPdf, uploadImage } = require('../middleware/upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XeroxService = require('../models/XeroxService');

// Set up file storage for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads/pdfs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// @route   GET /xerox
// @desc    Get all xerox services
// @access  Public
router.get('/', xeroxController.getAllServices);

// @route   GET /xerox/service/:id
// @desc    Get single xerox service
// @access  Public
router.get('/service/:id', xeroxController.getServiceById);

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

// @route   GET /xerox/upload
// @desc    Show PDF upload form
router.get('/upload', (req, res) => {
    res.render('xerox/upload', {
        title: 'Upload PDF for Printing',
        error: null
    });
});

// @route   POST /xerox/upload
// @desc    Handle PDF upload
router.post('/upload', upload.single('pdfFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.render('xerox/upload', {
                title: 'Upload PDF for Printing',
                error: 'Please select a PDF file to upload'
            });
        }

        // File was uploaded successfully
        const filePath = `/uploads/pdfs/${path.basename(req.file.path)}`;

        // Redirect to the print options page
        res.redirect(`/xerox/print-options?file=${encodeURIComponent(filePath)}`);
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.render('xerox/upload', {
            title: 'Upload PDF for Printing',
            error: 'Failed to upload PDF file. Please try again.'
        });
    }
});

// @route   GET /xerox/print-options
// @desc    Show print options for uploaded PDF
router.get('/print-options', (req, res) => {
    const filePath = req.query.file;

    if (!filePath) {
        req.flash('error_msg', 'No file specified');
        return res.redirect('/xerox/upload');
    }

    res.render('xerox/print-options', {
        title: 'Printing Options',
        filePath
    });
});

// @route   GET /xerox/binding
// @desc    Show binding options
router.get('/binding', (req, res) => {
    res.render('xerox/binding', {
        title: 'Binding Services'
    });
});

module.exports = router;