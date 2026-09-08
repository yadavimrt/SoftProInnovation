const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerMobile: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    address: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        pincode: { type: String, required: true },
        locality: { type: String, default: '' },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        landmark: { type: String, default: '' },
        addressType: { type: String, default: 'Home' },
    },
    subtotal: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'upi', 'cards', 'credit-card'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
}, { timestamps: true });

orderSchema.pre('validate', function () {
    if (!this.orderId) {
        this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
