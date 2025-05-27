const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  passenger: {
    name: String,
    age: Number,
    email: String,
  },
  flightDetails: {
    flightNo: String,
    departure: {
      time: String,
      airport: String,
      city: String,
    },
    destination: {
      time: String,
      airport: String,
      city: String,
    },
    date: Date,
  },
  seat: String,
  class: String,
  confirmationNumber: String
});

module.exports = mongoose.model('Booking', BookingSchema);
