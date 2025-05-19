const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment
} = require('../controllers/paymentControllerCars');


router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router; 