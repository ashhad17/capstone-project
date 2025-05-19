const Review = require('../models/Review');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews for a service provider
// @route   GET /api/v1/service-providers/:serviceProviderId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ serviceProvider: req.params.serviceProviderId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: reviews
  });
});

// @desc    Create a review
// @route   POST /api/v1/service-providers/:serviceProviderId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  // Add service provider and user to req.body
  req.body.serviceProvider = req.params.serviceProviderId;
  req.body.user = req.user.id;

  // Check if service provider exists
  const serviceProvider = await ServiceProvider.findById(req.params.serviceProviderId);
  if (!serviceProvider) {
    return next(
      new ErrorResponse(`Service provider not found with id of ${req.params.serviceProviderId}`, 404)
    );
  }

  // Check if user has already reviewed this service provider
  const existingReview = await Review.findOne({
    serviceProvider: req.params.serviceProviderId,
    user: req.user.id
  });

  if (existingReview) {
    return next(
      new ErrorResponse('You have already reviewed this service provider', 400)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Mark a review as helpful
// @route   POST /api/v1/service-providers/:serviceProviderId/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.reviewId}`, 404)
    );
  }

  review.helpful += 1;
  await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Report a review
// @route   POST /api/v1/service-providers/:serviceProviderId/reviews/:reviewId/report
// @access  Private
exports.reportReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.reviewId}`, 404)
    );
  }

  review.reported = true;
  await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
}); 