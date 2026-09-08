const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,

        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deleted'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
