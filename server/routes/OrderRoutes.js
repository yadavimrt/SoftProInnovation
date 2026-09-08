const express = require('express');
const mongoose = require('mongoose');
const Order = require('../model/Order');
const User = require('../model/User');

const Router = express.Router();

Router.post('/create', async (req, res) => {
    try {
        const { user_id, items, address, subtotal, fee, discount, totalAmount, paymentMethod } = req.body;

        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ success: false, message: 'Valid user ID is required' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
        }
        if (!address?.name || !address?.mobile || !address?.address || !address?.city || !address?.state || !address?.pincode) {
            return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
        }

        const user = await User.findById(user_id).select('name email mobile');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const orderItems = items.map((item) => {
            const price = Number(item.price) || 0;
            const quantity = Math.max(Number(item.quantity) || 1, 1);
            return {
                product_id: mongoose.Types.ObjectId.isValid(item._id || item.id) ? (item._id || item.id) : undefined,
                name: item.name || 'Product',
                thumbnail: item.thumbnail || '',
                category: item.category || '',
                price,
                quantity,
                total: price * quantity,
            };
        });

        const order = await Order.create({
            user_id,
            customerName: user.name,
            customerEmail: user.email,
            customerMobile: user.mobile || address.mobile,
            items: orderItems,
            address: {
                name: address.name,
                mobile: String(address.mobile),
                pincode: String(address.pincode),
                locality: address.locality || address.localiy || '',
                address: address.address || address.Address,
                city: address.city,
                state: address.state,
                landmark: address.landmark || '',
                addressType: address.addressType || 'Home',
            },
            subtotal: Number(subtotal) || 0,
            fee: Number(fee) || 0,
            discount: Number(discount) || 0,
            totalAmount: Number(totalAmount) || 0,
            paymentMethod: ['cod', 'upi', 'cards', 'credit-card'].includes(paymentMethod) ? paymentMethod : 'cod',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            status: 'pending',
        });

        return res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
    }
});

Router.get('/show', async (req, res) => {
    try {
        const filter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};
        const orders = await Order.find(filter)
            .populate('user_id', 'name email mobile')
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
});

Router.get('/user/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        const orders = await Order.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
    }
});

Router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({ $or: [{ _id: req.params.id }, { orderId: req.params.id }] }).populate('user_id', 'name email mobile');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
});

Router.patch('/:id/status', async (req, res) => {
    try {
        const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid order status' });
        const order = await Order.findOneAndUpdate(
            { $or: [{ _id: req.params.id }, { orderId: req.params.id }] },
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
    }
});

module.exports = Router;
