const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  mileage: {
    type: String,
    required: true
  },
  totalDriven: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'draft'],
    default: 'pending'
  },
  features: [String],
  images: [
    {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    }
  ],
  
  // Document fields
  rcDocument: {
    url: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  insuranceDocument: {
    url: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  pucDocument: {
    url: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  
  // Additional car specification fields
  exteriorColor: {
    type: String,
    required: false
  },
  interiorColor: {
    type: String,
    required: false
  },
  fuelType: {
    type: String,
    enum: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other'],
    required: false
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'],
    required: false
  },
  
  bodyType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Van'],
    required: false
  },
  
  // Seller information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  //sold to
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  //soldat
  soldAt: {
    type: Date,
    required: false
  },
  // Timestamps
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
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', carSchema);