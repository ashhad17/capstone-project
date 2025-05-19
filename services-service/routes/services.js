
const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(getServices)
  .post(protect, createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
