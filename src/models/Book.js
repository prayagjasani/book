const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
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
    pageCount: {
        type: Number,
        required: true,
        min: 1
    },
    coverImage: {
        type: String,
        default: '/images/books/default.jpg'
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', BookSchema);