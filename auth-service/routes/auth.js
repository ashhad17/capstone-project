const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  requestOtp,
  verifyOtp,
  verifyEmail,
  requestPasswordReset,
  sendContactEmail

} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dquspyuhw',
  api_key: '224371911834243',
  api_secret:'kQN3bU5w3sftEEi4LsNkbUAdCLM'
});
// Connect to database
// connectDB();


router.delete('/api/v1/delete-image', async (req, res) => {
  const { public_id } = req.body;
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log(result);
    if (result.result !== 'ok') {
      return res.status(400).json({ error: 'Failed to delete image' });
    }
    res.json(result);
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }  
});
// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);
router.post('/contact', sendContactEmail);
// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', protect, logout);

// @route   POST /api/v1/auth/request-otp
// const auth = require('../controllers/auth.controller');


router.get('/verify-email/:token',verifyEmail);


router.post('/request-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/v1/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put('/updatedetails', protect, updateDetails);

// @route   PUT /api/v1/auth/updatepassword
// @desc    Update user password
// @access  Private
router.put('/updatepassword', protect, updatePassword);

// @route   POST /api/v1/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', forgotPassword);



module.exports = router; 