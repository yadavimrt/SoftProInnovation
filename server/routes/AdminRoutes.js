const express = require('express');
const Router = express.Router();
const Admin = require('../model/Admin');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = String(password).trim();

        const data = await Admin.findOne({ email: cleanEmail });
        if (!data) {
            return res.status(400).json({ msg: "Email not found or Admin does not exist" });
        }

        if (String(data.password).trim() === cleanPassword) {
            const token = jwt.sign(
                { adminId: data._id, role: 'admin' },
                process.env.JWT_SECRET || 'ocCzmUh4OjfpybPJfx4chY5gUkmOfJ2dmjSwlJHfiSU',
                { expiresIn: '1d' }
            );

            // Find or link User account for this admin so profile and address work seamlessly
            let userDoc = await User.findOne({ email: cleanEmail });
            if (!userDoc) {
                userDoc = new User({
                    name: data.name,
                    email: cleanEmail,
                    password: data.password,
                    mobile: '',
                    status: 'active'
                });
                await userDoc.save();
            }

            return res.json({
                msg: "Sucess",
                token: token,
                role: "admin",
                name: data.name,
                adminId: data._id,
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
        } else {
            return res.status(400).json({ msg: "Password is Incorrect" });
        }
    } catch (er) {
        return res.status(500).json({ msg: "Server error: " + (er.message || "Database connection error") });
    }
});

Router.get("/show", async (req, res) => {
    try {
        const data = await Admin.find();
        res.json(data);
    } catch {
        res.status(500).json({ message: "Error fetching admin data" });
    }
});

Router.put("/update/:id", async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: "Admin updated", admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: "Error updating admin", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Admin updated', admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: "Error patching admin", error: error.message });
    }
});

Router.delete("/delete/:id", async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: "Admin deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
});

module.exports = Router;
