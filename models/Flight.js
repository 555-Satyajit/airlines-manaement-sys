// models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: /^[A-Z]{2}[0-9]{3,4}$/
    },
    aircraft: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aircraft',
        required: true
    },
    departureAirport: {
        code: {
            type: String,
            required: true,
            uppercase: true,
            length: 3
        },
        name: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    arrivalAirport: {
        code: {
            type: String,
            required: true,
            uppercase: true,
            length: 3
        },
        name: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    pricing: {
        economy: {
            type: Number,
            required: true,
            min: 0
        },
        premium: {
            type: Number,
            required: true,
            min: 0
        },
        business: {
            type: Number,
            required: true,
            min: 0
        },
        first: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    status: {
        type: String,
        enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed'],
        default: 'scheduled'
    },
    gate: {
        type: String,
        default: null
    },
    terminal: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ departureTime: 1 });
flightSchema.index({ 'departureAirport.code': 1, 'arrivalAirport.code': 1 });
flightSchema.index({ status: 1 });

module.exports = mongoose.model('Flight', flightSchema);