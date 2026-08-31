const express = require('express');
const Router = express.Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register User
Router.post('/register', async (req, res) => {
    try {
        const { name, email, password, mobile, status, gender, picture } = req.body;
        
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
            picture: picture || ''
        });

        await data.save();
        return res.status(201).json({
            success: true,
            message: "Registration successful! Please sign in.",
            user: {
                _id: data._id,
                name: data.name,
                email: data.email,
                mobile: data.mobile
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
                mobile: user.mobile
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

Router.delete('/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

module.exports = Router;
