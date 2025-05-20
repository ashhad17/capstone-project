const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  createOrderCars,
  verifyPaymentCars
} = require('../controllers/paymentController');


router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/create-order-cars', protect, createOrderCars);
router.post('/verify-cars', protect, verifyPaymentCars);


module.exports = router; 