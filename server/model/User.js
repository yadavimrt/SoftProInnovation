const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String, 
        required: true
    },
    mobile: {
        type: String, 
        required: true
    },
    status: {
        type: String, 
        enum: ["active", "inactive"],
        default: "active"
    },
    picture: {
        type: String, 
        default: ""
    },
    gender: {
        type: String, 
        default: "other"
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);
module.exports = User;