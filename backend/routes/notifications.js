const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { validateNotification, handleValidationErrors } = require('../middleware/validate');

// @route   GET /api/v1/notifications
// @desc    Get all notifications
// @access  Private
router.get('/', protect, getNotifications);

// @route   GET /api/v1/notifications/:id
// @desc    Get single notification
// @access  Private
router.get('/:id', protect, getNotification);

// @route   POST /api/v1/notifications
// @desc    Create new notification
// @access  Private
router.post('/', protect, validateNotification, handleValidationErrors, createNotification);

// @route   PUT /api/v1/notifications/:id
// @desc    Update notification
// @access  Private
router.put('/:id', protect, validateNotification, handleValidationErrors, updateNotification);

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, deleteNotification);

// @route   PATCH /api/v1/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', protect, markAsRead);

// @route   PATCH /api/v1/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', protect, markAllAsRead);

module.exports = router; 