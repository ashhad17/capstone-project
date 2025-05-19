const Service = require('../models/Service');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
// /const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');

// @desc    Get all services with filters
// @route   GET /api/v1/services
// @access  Public
exports.getServices = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);

  const services = await Service.find(filter)
    .populate('serviceProvider', 'name email rating reviewCount')
    .lean();

  res.status(200).json({ success: true, count: services.length, data: services });
});



// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('serviceProvider', 'name email rating reviewCount');
  
  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: service
  });
});
exports.getServicesByIds = asyncHandler(async (req, res, next) => {
  const { ids } = req.query; // Expecting an array of IDs in the query
  if (!ids || !Array.isArray(ids)) {
    return next(new ErrorResponse('Invalid or missing service IDs', 400));
  }

  const services = await Service.find({ _id: { $in: ids } });
  res.status(200).json({ success: true, data: services });
});


// Utility to get provider ID from user ID
const getProviderId = async (userId) => {
  const provider = await ServiceProvider.findOne({ user: userId }).select('_id');
  if (!provider) throw new ErrorResponse('Service provider not found for this user', 404);
  return provider._id;
};

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private
exports.createService = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'service_provider') {
    req.body.serviceProvider = await getProviderId(req.user.id);
  }
req.body.user = req.user.id;
  const provider = await ServiceProvider.findById(req.body.serviceProvider);
  if (!provider || (provider.user.toString() !== req.user.id && req.user.role !== 'admin')) {
    return next(new ErrorResponse('Not authorized to add service for this provider', 403));
  }

  const service = await Service.create(req.body);
  await ServiceProvider.findByIdAndUpdate(req.body.serviceProvider, { $push: { services: service._id } });

  res.status(201).json({ success: true, data: service });
});

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }

  if (service.serviceProvider.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this service', 401));
  }

  await ServiceProvider.findByIdAndUpdate(service.serviceProvider, { $pull: { services: service._id } });
  await service.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is service provider or admin
  const serviceProvider = await ServiceProvider.findById(service.serviceProvider);
  if (!serviceProvider) {
    return next(
      new ErrorResponse(`Service provider not found`, 404)
    );
  }

  // Check if user is the service provider or an admin
  if (serviceProvider.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401)
    );
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});
