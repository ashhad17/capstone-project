const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL of the main image
    default: "true", // Ensure this is required if necessary
  },
  imagePublicId: {
    type: String, // Cloudinary public ID for main image
  },
  gallery: {
    type: [String], // Array of image URLs
    default: [], // Default to an empty array
  },
  galleryPublicIds: {
    type: [String], // Array of Cloudinary public IDs for gallery images
    default: [],
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialties: [String],
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default:[] // Reference to the Service model
  }],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  hours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  phone: String,
  email: String,
  website: String,
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive', 'suspended'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
serviceProviderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// When a service provider is created, update the user role to 'service_provider'
serviceProviderSchema.post('save', async function() {
  try {
    // Only run this if it's a new document
    if (this.isNew) {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(this.user, { role: 'service_provider' });
    }
  } catch (err) {
    console.error('Error updating user role:', err);
  }
});

// Middleware to handle image cleanup when updating
serviceProviderSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    const removedPublicIds = update.$set?.removedPublicIds || [];

    // Delete images from Cloudinary if there are any removed public IDs
    if (removedPublicIds.length > 0) {
      await Promise.all(
        removedPublicIds.map(publicId => 
          cloudinary.uploader.destroy(publicId)
        )
      );
    }

    // Remove the removedPublicIds from the update object
    if (update.$set) {
      delete update.$set.removedPublicIds;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to handle image cleanup when removing a service provider
serviceProviderSchema.pre('remove', async function(next) {
  try {
    // Delete main image
    if (this.imagePublicId) {
      await cloudinary.uploader.destroy(this.imagePublicId);
    }

    // Delete gallery images
    if (this.galleryPublicIds && this.galleryPublicIds.length > 0) {
      await Promise.all(
        this.galleryPublicIds.map(publicId => 
          cloudinary.uploader.destroy(publicId)
        )
      );
    }

    // Delete associated services
    await this.model('Service').deleteMany({ serviceProvider: this._id });
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to update only changed fields
serviceProviderSchema.methods.updateChangedFields = async function(changes) {
  const allowedFields = Object.keys(this.schema.paths);
  
  // Filter out fields that aren't in the schema
  const validChanges = Object.keys(changes).reduce((acc, key) => {
    if (allowedFields.includes(key)) {
      acc[key] = changes[key];
    }
    return acc;
  }, {});

  // Update only the changed fields
  Object.assign(this, validChanges);
  return this.save();
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);