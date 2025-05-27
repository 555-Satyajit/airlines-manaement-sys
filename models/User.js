// models/User.js (Enhanced for booking system)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    role: {
        type: String,
        enum: ['user','passenger', 'admin', 'staff'],
        default: 'user'
    },
    preferences: {
        mealPreference: {
            type: String,
            enum: ['none', 'vegetarian', 'vegan', 'kosher', 'halal', 'gluten-free','regular'],
            default: 'none'
        },
        seatPreference: {
            type: String,
            enum: ['window', 'aisle', 'middle', 'no-preference','regular'],
            default: 'no-preference'
        },
        classPreference: {
            type: String,
            enum: ['Economy', 'Premium', 'Business', 'First','regular'],
            default: 'Economy'
        }
    },
    frequentFlyerNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ frequentFlyerNumber: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.matchPassword = async function(candidatePassword) {
    return await this.comparePassword(candidatePassword);
};
module.exports = mongoose.model('User', userSchema);