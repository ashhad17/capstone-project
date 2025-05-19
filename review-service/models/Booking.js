const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      required: true
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add index for availability check
bookingSchema.index({ serviceProvider: 1, date: 1, time: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 