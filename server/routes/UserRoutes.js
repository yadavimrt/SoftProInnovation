const express = require('express');
const mongoose = require('mongoose');
const Router = express.Router();
const User = require('../model/User');
const Admin = require('../model/Admin');
const Address = require('../model/Address');
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

        const adminCheck = await Admin.findOne({ email: user.email.toLowerCase() });
        const userRole = adminCheck ? 'admin' : 'user';

        const token = jwt.sign(
            { userId: user._id, role: userRole, adminId: adminCheck?._id },
            process.env.JWT_SECRET || 'ocCzmUh4OjfpybPJfx4chY5gUkmOfJ2dmjSwlJHfiSU',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            role: userRole,
            adminId: adminCheck?._id,
            name: user.name,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                picture: user.picture || ''
            }
        });
    } catch (error) {
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
    } catch {
        return res.status(500).json({ message: "Error fetching users" });
    }
});

// Get currently authenticated user/admin profile
Router.get('/current-user', async (req, res) => {
    try {
        let authHeader = req.headers.authorization || '';
        let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || '');
        let decoded = null;

        if (token) {
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET || 'ocCzmUh4OjfpybPJfx4chY5gUkmOfJ2dmjSwlJHfiSU');
            } catch {
                // Token expired or alternate secret
            }
        }

        const adminId = req.query.adminId || decoded?.adminId;
        const userId = req.query.userId || decoded?.userId;
        const queryEmail = req.query.email ? req.query.email.toLowerCase() : null;
        const queryName = req.query.name ? req.query.name.trim() : null;
        const role = req.query.role || decoded?.role;

        // Case 1: Identified by adminId or role 'admin'
        if (adminId || role === 'admin') {
            let adminDoc = null;
            if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
                adminDoc = await Admin.findById(adminId);
            }
            if (!adminDoc && queryEmail) {
                adminDoc = await Admin.findOne({ email: queryEmail });
            }
            if (!adminDoc && queryName) {
                adminDoc = await Admin.findOne({ name: queryName });
            }
            if (!adminDoc) {
                adminDoc = await Admin.findOne();
            }

            if (adminDoc) {
                let userDoc = await User.findOne({ email: adminDoc.email.toLowerCase() });
                if (!userDoc) {
                    userDoc = new User({
                        name: adminDoc.name,
                        email: adminDoc.email.toLowerCase(),
                        password: adminDoc.password,
                        mobile: '',
                        status: 'active'
                    });
                    await userDoc.save();
                }

                return res.status(200).json({
                    success: true,
                    role: 'admin',
                    user: {
                        _id: userDoc._id,
                        name: userDoc.name,
                        email: userDoc.email,
                        mobile: userDoc.mobile || '',
                        picture: userDoc.picture || '',
                        status: userDoc.status || 'active',
                        gender: userDoc.gender || 'other'
                    }
                });
            }
        }

        // Case 2: Identified by userId
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const userDoc = await User.findById(userId).select('-password');
            if (userDoc) {
                return res.status(200).json({ success: true, role: 'user', user: userDoc });
            }
        }

        // Case 3: Identified by email
        if (queryEmail) {
            const userDoc = await User.findOne({ email: queryEmail }).select('-password');
            if (userDoc) {
                return res.status(200).json({ success: true, role: 'user', user: userDoc });
            }
        }

        // Case 4: Identified by name
        if (queryName) {
            const userDoc = await User.findOne({ name: queryName }).select('-password');
            if (userDoc) {
                return res.status(200).json({ success: true, role: 'user', user: userDoc });
            }
        }

        return res.status(404).json({ success: false, message: 'User not found for active session' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error identifying current user', error: error.message });
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

        let user = await User.findById(id);
        if (!user) {
            const adminDoc = await Admin.findById(id);
            if (adminDoc) {
                user = await User.findOne({ email: adminDoc.email.toLowerCase() });
            }
        }
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { name, email, mobile, gender } = req.body;

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: user._id } 
            });
            if (emailExists) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email address is already in use by another account" 
                });
            }
            user.email = email.toLowerCase();
        }

        if (name && name.trim()) user.name = name.trim();
        if (mobile && mobile.trim()) user.mobile = mobile.trim();
        if (gender) user.gender = gender;
        if (req.file) {
            user.picture = `/uploads/profiles/${req.file.filename}`;
        }

        await user.save();

        // If this user is also an Admin, sync Admin record
        try {
            await Admin.findOneAndUpdate({ email: user.email }, { name: user.name });
        } catch {
            // Optional sync
        }

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            picture: user.picture || '',
            gender: user.gender,
            status: user.status
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: safeUser
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Failed to update profile", 
            error: error.message 
        });
    }
});

Router.put('/update/:id', profileUpload.single('picture'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.picture = `/uploads/profiles/${req.file.filename}`;
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
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
            await Address.deleteMany({ user_id: id });
        } catch {
            // Ignore non-critical cleanup error
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
    }
};

Router.delete('/delete/:id', handleDeleteUser);
Router.post('/delete/:id', handleDeleteUser);
Router.delete('/:id', handleDeleteUser);

module.exports = Router;
