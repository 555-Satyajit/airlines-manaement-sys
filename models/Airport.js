
// models/Airport.js
const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        length: 3,
        match: /^[A-Z]{3}$/
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    timezone: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
    },
    terminals: [{
        name: String,
        gates: [String]
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    }
}, {
    timestamps: true
});

airportSchema.index({ code: 1 });
airportSchema.index({ city: 1 });
airportSchema.index({ country: 1 });

module.exports = mongoose.model('Airport', airportSchema);