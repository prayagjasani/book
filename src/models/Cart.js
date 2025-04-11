const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'XeroxService',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1
        },
        pageCount: {
            type: Number,
            default: 1
        },
        options: [{
            name: String,
            price: Number
        }],
        notes: String,
        uploadedFile: String,
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = function() {
    let total = 0;
    this.items.forEach(item => {
        let itemTotal = item.price * item.quantity;
        if (item.pageCount > 1 &&
            (item.service.priceUnit === 'per_page' || item.service.category === 'document_xerox' || item.service.category === 'pdf_printing')) {
            itemTotal *= item.pageCount;
        }

        // Add option prices
        if (item.options && item.options.length > 0) {
            item.options.forEach(option => {
                itemTotal += option.price;
            });
        }

        total += itemTotal;
    });

    this.totalPrice = total;
    return total;
};

// Pre-save hook to calculate total price
cartSchema.pre('save', function(next) {
    this.calculateTotalPrice();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;