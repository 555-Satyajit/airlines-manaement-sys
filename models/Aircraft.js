// models/Aircraft.js
const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    registration: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    seatConfiguration: {
        firstClass: {
            rows: { type: Number, default: 0 },
            seatsPerRow: { type: Number, default: 0 }
        },
        business: {
            rows: { type: Number, default: 0 },
            seatsPerRow: { type: Number, default: 0 }
        },
        premium: {
            rows: { type: Number, default: 0 },
            seatsPerRow: { type: Number, default: 0 }
        },
        economy: {
            rows: { type: Number, required: true },
            seatsPerRow: { type: Number, required: true }
        }
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired'],
        default: 'active'
    },
    yearManufactured: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 5
    }
}, {
    timestamps: true
});

aircraftSchema.index({ registration: 1 });
aircraftSchema.index({ status: 1 });

module.exports = mongoose.model('Aircraft', aircraftSchema);

