const express = require('express');
const Router = express.Router();
const Cart = require('../model/cart');
const Product = require('../model/product');
const User = require('../model/User');


Router.post('/add', async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        const qty = parseInt(quantity, 10) || 1;

        if (!user_id || !product_id) {
            return res.status(400).json({
                success: false,
                message: 'Both user_id and product_id are required'
            });
        }

        // Check if product exists and is active
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product already exists in user's active cart
        let cartItem = await Cart.findOne({
            user_id,
            product_id,
            status: 'active'
        });

        if (cartItem) {
            // Update existing cart item quantity
            cartItem.quantity += qty;
            await cartItem.save();
            await cartItem.populate('product_id');

            return res.status(200).json({
                success: true,
                message: 'Cart quantity updated successfully',
                cart: cartItem
            });
        } else {
            // Create new cart document
            cartItem = new Cart({
                user_id,
                product_id,
                quantity: qty,
                status: 'active'
            });

            await cartItem.save();
            await cartItem.populate('product_id');

            return res.status(201).json({
                success: true,
                message: 'Product added to cart successfully',
                cart: cartItem
            });
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
});


Router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await Cart.find({
            user_id: userId,
            status: 'active'
        })
            .populate({
                path: 'product_id',
                populate: { path: 'category_id', select: 'category name' }
            })
            .sort({ createdAt: -1 });

        // Calculate summary (totals)
        let totalItems = 0;
        let subtotal = 0;

        cartItems.forEach((item) => {
            const p = item.product_id;
            if (p) {
                totalItems += item.quantity;
                subtotal += (p.price || 0) * item.quantity;
            }
        });

        return res.status(200).json({
            success: true,
            count: cartItems.length,
            totalItems,
            subtotal,
            cart: cartItems
        });
    } catch (error) {
        console.error('Fetch user cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart items',
            error: error.message
        });
    }
});


Router.get(['/show', '/all'], async (req, res) => {
    try {
        const matchFilter = {};
        if (req.query.status && req.query.status !== 'all') {
            matchFilter.status = req.query.status;
        } else {
            matchFilter.status = 'active';
        }

        const allCarts = await Cart.find(matchFilter)
            .populate('user_id', 'name email mobile')
            .populate('product_id')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: allCarts.length,
            carts: allCarts
        });
    } catch (error) {
        console.error('Fetch all carts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching carts',
            error: error.message
        });
    }
});


Router.get('/get/:id', async (req, res) => {
    try {
        const cartItem = await Cart.findById(req.params.id)
            .populate('user_id', 'name email mobile')
            .populate('product_id');

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        return res.status(200).json({
            success: true,
            cart: cartItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching cart item',
            error: error.message
        });
    }
});


Router.put('/update/:id', async (req, res) => {
    try {
        const { quantity, status } = req.body;
        const updateData = {};

        if (quantity !== undefined) {
            const qty = parseInt(quantity, 10);
            if (qty < 1) {
                // If quantity reduced below 1, remove item from cart
                const deletedItem = await Cart.findByIdAndDelete(req.params.id);
                return res.status(200).json({
                    success: true,
                    message: 'Cart item removed because quantity was set to 0',
                    deleted: deletedItem
                });
            }
            updateData.quantity = qty;
        }

        if (status) {
            updateData.status = status;
        }

        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('product_id');

        if (!updatedCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
});


Router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedCart = await Cart.findByIdAndDelete(req.params.id);

        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cart item removed successfully',
            cart: deletedCart
        });
    } catch (error) {
        console.error('Delete cart item error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete cart item',
            error: error.message
        });
    }
});


Router.delete('/clear/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Cart.deleteMany({ user_id: userId });

        return res.status(200).json({
            success: true,
            message: 'User cart cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear user cart',
            error: error.message
        });
    }
});

module.exports = Router;
