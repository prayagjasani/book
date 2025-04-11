const mongoose = require('mongoose');

const XeroxServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    priceUnit: {
        type: String,
        enum: ['page', 'document', 'hour'],
        default: 'page'
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    isColor: {
        type: Boolean,
        default: false
    },
    paperSize: {
        type: String,
        enum: ['A4', 'A5', 'A3', 'Letter', 'Legal'],
        default: 'A4'
    },
    estimatedTime: {
        type: String,
        default: '1-2 days'
    },
    additionalOptions: [{
        name: String,
        price: Number,
        description: String
    }],
    image: {
        type: String,
        default: '/images/services/default.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('XeroxService', XeroxServiceSchema);