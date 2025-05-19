const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} = require('../controllers/userController');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), getUsers);

// Get single user
router.get('/:id', protect, getUser);

// Create user (admin only)
router.post('/', protect, authorize('admin'), createUser);

// Update user
router.put('/:id', protect, updateUser);

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Update user status (admin only)
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router; 