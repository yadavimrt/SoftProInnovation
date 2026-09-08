const express = require('express');
const Router = express.Router();
const Address = require('../model/Address');
const User = require('../model/User');
const mongoose = require('mongoose');

// Helper to normalize address inputs (locality/localiy, address/Address)
const extractAddressPayload = (body) => {
    const locality = body.locality || body.localiy || '';
    const address = body.address || body.Address || '';
    return {
        name: body.name ? body.name.trim() : '',
        mobile: body.mobile ? String(body.mobile).trim() : '',
        pincode: body.pincode ? String(body.pincode).trim() : '',
        locality: locality ? locality.trim() : '',
        address: address ? address.trim() : '',
        city: body.city ? body.city.trim() : '',
        state: body.state ? body.state.trim() : '',
        landmark: body.landmark ? body.landmark.trim() : '',
        addressType: body.addressType || 'Home',
        status: body.status || 'active',
        isdefault: body.isdefault || 'no',
        user_id: body.user_id || body.userId
    };
};

// 1. ADD NEW ADDRESS
Router.post('/add', async (req, res) => {
    try {
        const payload = extractAddressPayload(req.body);

        if (!payload.user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        if (!payload.name || !payload.mobile || !payload.pincode || !payload.locality || !payload.address || !payload.city || !payload.state) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (name, mobile, pincode, locality, address, city, state) must be provided'
            });
        }

        // Verify User exists
        if (mongoose.Types.ObjectId.isValid(payload.user_id)) {
            const userExists = await User.findById(payload.user_id);
            if (!userExists) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        // Count existing addresses for user
        const userAddressesCount = await Address.countDocuments({ user_id: payload.user_id, status: 'active' });

        // If user has no existing addresses, make this address default automatically
        if (userAddressesCount === 0) {
            payload.isdefault = 'yes';
        }

        // If this address is set to default, reset all other addresses for this user to 'no'
        if (payload.isdefault === 'yes') {
            await Address.updateMany(
                { user_id: payload.user_id },
                { $set: { isdefault: 'no' } }
            );
        }

        const newAddress = new Address(payload);
        await newAddress.save();

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        });
    } catch (error) {
        console.error('Error adding address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message
        });
    }
});

// 2. GET ALL ADDRESSES (ADMIN VIEW or Filtered by Query)
Router.get('/show', async (req, res) => {
    try {
        const filter = {};
        if (req.query.user_id) {
            filter.user_id = req.query.user_id;
        }
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        const addresses = await Address.find(filter)
            .populate('user_id', 'name email mobile')
            .sort({ isdefault: -1, createdAt: -1 });

        return res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch addresses',
            error: error.message
        });
    }
});

// 3. GET ADDRESSES FOR SPECIFIC USER
Router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const filter = { user_id: userId };
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        } else if (!req.query.status) {
            filter.status = 'active';
        }

        const addresses = await Address.find(filter).sort({ isdefault: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user addresses',
            error: error.message
        });
    }
});

// 4. GET SINGLE ADDRESS DETAILS BY ID
Router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Address ID' });
        }

        const address = await Address.findById(id).populate('user_id', 'name email mobile');
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        return res.status(200).json({
            success: true,
            address
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch address details',
            error: error.message
        });
    }
});

// 5. UPDATE ADDRESS (Supports PUT and POST)
const handleUpdateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Address ID' });
        }

        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const payload = extractAddressPayload({ ...existingAddress.toObject(), ...req.body });

        // If changing to default, unset other user addresses default flag
        if (payload.isdefault === 'yes') {
            await Address.updateMany(
                { user_id: existingAddress.user_id, _id: { $ne: id } },
                { $set: { isdefault: 'no' } }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(id, payload, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address: updatedAddress
        });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update address',
            error: error.message
        });
    }
};

Router.put('/update/:id', handleUpdateAddress);
Router.post('/update/:id', handleUpdateAddress);
Router.put('/:id', handleUpdateAddress);

// 6. SET DEFAULT ADDRESS
const handleSetDefault = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Address ID' });
        }

        const address = await Address.findById(id);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Set all user addresses to isdefault: 'no'
        await Address.updateMany(
            { user_id: address.user_id },
            { $set: { isdefault: 'no' } }
        );

        // Set target address to isdefault: 'yes'
        address.isdefault = 'yes';
        await address.save();

        return res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            address
        });
    } catch (error) {
        console.error('Error setting default address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to set default address',
            error: error.message
        });
    }
};

Router.put('/set-default/:id', handleSetDefault);
Router.post('/set-default/:id', handleSetDefault);

// 7. DELETE ADDRESS (Supports DELETE and POST)
const handleDeleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Address ID' });
        }

        const deletedAddress = await Address.findByIdAndDelete(id);
        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // If deleted address was default, make another active address default if exists
        if (deletedAddress.isdefault === 'yes') {
            const nextAddress = await Address.findOne({ user_id: deletedAddress.user_id, status: 'active' });
            if (nextAddress) {
                nextAddress.isdefault = 'yes';
                await nextAddress.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete address',
            error: error.message
        });
    }
};

Router.delete('/delete/:id', handleDeleteAddress);
Router.post('/delete/:id', handleDeleteAddress);
Router.delete('/:id', handleDeleteAddress);

module.exports = Router;
