const express = require('express');
const mongoose = require('mongoose');
const Router = express.Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const profileUpload = require('../middleware/profileUpload');

// Register User
Router.post('/register', profileUpload.single('picture'), async (req, res) => {
    try {
        const { name, email, password, mobile, status, gender } = req.body;
        
        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide Name, Email, Password, and Mobile number" 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User with this email is already registered" 
            });
        }

        // Hash password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        const data = new User({
            name,
            email: email.toLowerCase(),
            password: password,  
            mobile,
            status: status || 'active',
            gender: gender || 'other',
            picture: req.file ? `/uploads/profiles/${req.file.filename}` : ''
        });

        await data.save();
        return res.status(201).json({
            success: true,
            message: "Registration successful! Please sign in.",
            user: {
                _id: data._id,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                picture: data.picture
            }
        });
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message 
        }); 
    }
});

// Login User
Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Email does not exist" 
            });
        }

        // Check password (supports bcrypt hash or plaintext)
        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (user.password === password);
        }

        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Password is incorrect" 
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: 'user' },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            role: "user",
            name: user.name,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error("User login error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
});
  
Router.get('/show', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users" });
    }
});

// Get user profile by ID
Router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ success: false, message: "Error fetching user profile", error: error.message });
    }
});

// Update user profile (with optional avatar picture upload)
Router.put('/profile/:id', profileUpload.single('picture'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { name, email, mobile, gender } = req.body;

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: id } 
            });
            if (emailExists) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email address is already in use by another account" 
                });
            }
            user.email = email.toLowerCase();
        }

        if (name) user.name = name.trim();
        if (mobile) user.mobile = mobile.trim();
        if (gender) user.gender = gender;
        if (req.file) {
            user.picture = `/uploads/profiles/${req.file.filename}`;
        }

        await user.save();

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            picture: user.picture,
            gender: user.gender,
            status: user.status
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: safeUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to update profile", 
            error: error.message 
        });
    }
});

Router.put('/update/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        res.json({ message: 'User updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        res.json({ message: 'User patched', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error patching user", error: error.message });
    }
});

const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found or already deleted' });
        }
        // Cleanup addresses belonging to this user
        try {
            const Address = require('../model/address');
            await Address.deleteMany({ user_id: id });
        } catch (e) {
            console.warn('Address cleanup note:', e.message);
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
    }
};

Router.delete('/delete/:id', handleDeleteUser);
Router.post('/delete/:id', handleDeleteUser);
Router.delete('/:id', handleDeleteUser);

module.exports = Router;
