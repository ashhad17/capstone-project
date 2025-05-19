const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update service provider's average rating and review count when a review is created/updated/deleted
reviewSchema.post('save', async function() {
  try {
    const ServiceProvider = mongoose.model('ServiceProvider');
    const reviews = await this.constructor.find({ serviceProvider: this.serviceProvider });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await ServiceProvider.findByIdAndUpdate(this.serviceProvider, {
      rating: averageRating,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating service provider rating:', error);
  }
});

// Update service provider's average rating and review count when a review is deleted
reviewSchema.post('remove', async function() {
  try {
    const ServiceProvider = mongoose.model('ServiceProvider');
    const reviews = await this.constructor.find({ serviceProvider: this.serviceProvider });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await ServiceProvider.findByIdAndUpdate(this.serviceProvider, {
      rating: averageRating,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating service provider rating:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema); 