const mongoose = require('mongoose');

const xeroxServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    priceUnit: {
        type: String,
        enum: ['per_page', 'per_document', 'per_book'],
        default: 'per_page'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['document_xerox', 'book_xerox', 'pdf_printing', 'binding', 'other']
    },
    additionalOptions: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        description: String
    }],
    isColor: {
        type: Boolean,
        default: false
    },
    paperSize: {
        type: String,
        enum: ['A4', 'A3', 'Letter', 'Legal', 'custom'],
        default: 'A4'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    estimatedTime: {
        type: String,
        default: 'Varies by order size'
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

const XeroxService = mongoose.model('XeroxService', xeroxServiceSchema);

module.exports = XeroxService;