const Razorpay = require('razorpay');
const crypto = require('crypto');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const {sendMail} = require('../utils/mailer');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');

// Initialize Razorpay with proper configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order for service booking
// @route   POST /api/v1/payments/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency, serviceProviderId } = req.body;

  // Validate service provider exists
  const serviceProvider = await ServiceProvider.findById(serviceProviderId);
  if (!serviceProvider) {
    return next(new ErrorResponse('Service provider not found', 404));
  }

  // Create Razorpay order
  const options = {
    amount: amount,
    currency: currency || 'INR',
    receipt: `service_${serviceProviderId}_${Date.now().toString().slice(-6)}`,
    notes: {
      serviceProviderId: serviceProviderId,
      userId: req.user.id
    }
  };

  try {
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order);
    
    res.status(200).json({
      success: true,
      orderId: order.id
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return next(new ErrorResponse(`Payment initiation failed: ${error.message}`, 500));
  }
});

// @desc    Verify payment and create booking
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    serviceProviderId,
    services,
    date,
    time,
    totalPrice
  } = req.body;

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return next(new ErrorResponse('Invalid payment signature', 400));
  }

  // Get service provider details
  const serviceProvider = await ServiceProvider.findById(serviceProviderId).populate('user', 'name email');
  if (!serviceProvider) {
    return next(new ErrorResponse('Service provider not found', 404));
  }

  // Get user details
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Create booking
  const booking = await Booking.create({
    serviceProvider: serviceProviderId,
    user: req.user.id,
    services,
    date,
    time,
    totalPrice,
    status: 'confirmed',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id
  });

  // Create notifications
  const notifications = [
    // Notification for user
    {
      user: req.user.id,
      title: 'Booking Confirmed! 🎉',
      description: `Your service booking with ${serviceProvider.name} has been confirmed for ${date} at ${time}. Order ID: ${razorpay_order_id}`,
      type: 'booking'
    },
    // Notification for service provider
    {
      user: serviceProvider.user._id,
      title: 'New Booking! 📅',
      description: `You have a new booking from ${user.name} for ${date} at ${time}. Order ID: ${razorpay_order_id}`,
      type: 'booking'
    },
    // Notification for admin
    {
      user: (await User.findOne({ role: 'admin' }))._id,
      title: 'New Service Booking! 🚗',
      description: `A new service booking has been made by ${user.name} with ${serviceProvider.name}. Order ID: ${razorpay_order_id}`,
      type: 'system'
    }
  ];

  try {
    // Create notifications in database
    await Notification.insertMany(notifications);
    console.log('Notifications created successfully');
  } catch (notificationError) {
    console.error('Error creating notifications:', notificationError);
    // Continue with the process even if notifications fail
  }

  // Send emails
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.EMAIL_FROM && process.env.EMAIL_PASS) {
    try {
      const emailPromises = [];
      
      if (user.email) {
        const userEmailText = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
              </div>
              <div class="content">
                <p>Dear ${user.name},</p>
                <p>Your service booking has been confirmed! We're looking forward to serving you.</p>
                
                <div class="details">
                  <h2>Booking Details</h2>
                  <p><strong>Service Provider:</strong> ${serviceProvider.name}</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount Paid:</strong> ₹${totalPrice.toLocaleString()}</p>
                </div>

                <p>Services Booked:</p>
                <ul>
                  ${services.map(service => `
                    <li>${service.name} - ₹${service.price.toLocaleString()} (${service.duration})</li>
                  `).join('')}
                </ul>

                <a href="${process.env.FRONTEND_URL}/dashboard/bookings" class="button">View Booking Details</a>
              </div>
              <div class="footer">
                <p>Thank you for choosing WheelsTrust!</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        emailPromises.push(
          sendMail(user.email, '🎉 Your Service Booking is Confirmed! - WheelsTrust', userEmailText)
        );
      }
      
      if (serviceProvider.user.email) {
        const providerEmailText = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 New Booking Received!</h1>
              </div>
              <div class="content">
                <p>Dear ${serviceProvider.name},</p>
                <p>You have received a new service booking through WheelsTrust.</p>
                
                <div class="details">
                  <h2>Booking Details</h2>
                  <p><strong>Customer:</strong> ${user.name}</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount:</strong> ₹${totalPrice.toLocaleString()}</p>
                </div>

                <p>Services Booked:</p>
                <ul>
                  ${services.map(service => `
                    <li>${service.name} - ₹${service.price.toLocaleString()} (${service.duration})</li>
                  `).join('')}
                </ul>

                <a href="${process.env.FRONTEND_URL}/dashboard/bookings" class="button">View Booking Details</a>
              </div>
              <div class="footer">
                <p>Thank you for using WheelsTrust!</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        emailPromises.push(
          sendMail(serviceProvider.user.email, '🎉 New Service Booking - WheelsTrust', providerEmailText)
        );
      }
      
      if (process.env.ADMIN_EMAIL) {
        const adminEmailText = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Service Booking</h1>
              </div>
              <div class="content">
                <p>A new service booking has been completed on WheelsTrust.</p>
                
                <div class="details">
                  <h2>Booking Details</h2>
                  <p><strong>Service Provider:</strong> ${serviceProvider.name}</p>
                  <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                  <p><strong>Date:</strong> ${date}</p>
                  <p><strong>Time:</strong> ${time}</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount:</strong> ₹${totalPrice.toLocaleString()}</p>
                </div>

                <p>Services Booked:</p>
                <ul>
                  ${services.map(service => `
                    <li>${service.name} - ₹${service.price.toLocaleString()} (${service.duration})</li>
                  `).join('')}
                </ul>
              </div>
              <div class="footer">
                <p>WheelsTrust Admin Dashboard</p>
              </div>
            </div>
          </body>
          </html>
        `;
        emailPromises.push(
          sendMail(process.env.ADMIN_EMAIL, 'New Service Booking - WheelsTrust', adminEmailText)
        );
      }

      if (emailPromises.length > 0) {
        await Promise.all(emailPromises);
        console.log('All emails sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the transaction if email sending fails
    }
  } else {
    console.warn('Email configuration is missing. Skipping email notifications.');
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking created',
    data: {
      bookingId: booking._id,
      status: booking.status,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    }
  });
}); 