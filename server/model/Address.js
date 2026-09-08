const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
        },
        locality: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        landmark: {
            type: String,
            default: '',
            trim: true,
        },
        addressType: {
            type: String,
            enum: ['Home', 'Work', 'Other'],
            default: 'Home',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        isdefault: {
            type: String,
            enum: ['yes', 'no'],
            default: 'no',
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

// Backward compatibility getters/aliases for legacy field names (localiy, Address)
addressSchema.virtual('localiy').get(function () {
    return this.locality;
});
addressSchema.virtual('Address').get(function () {
    return this.address;
});

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);
module.exports = Address;