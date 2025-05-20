const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  getReviews,
  createReview,
  markHelpful,
  reportReview
} = require('../controllers/reviewController');

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:reviewId/helpful')
  .post(protect, markHelpful);

router.route('/:reviewId/report')
  .post(protect, reportReview);

module.exports = router; 