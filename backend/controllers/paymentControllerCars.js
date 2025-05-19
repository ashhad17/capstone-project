const Razorpay = require('razorpay');
const crypto = require('crypto');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const {sendMail} = require('../utils/mailer');

// Initialize Razorpay with proper configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency, carId } = req.body;

  // Validate car exists and is available
  const car = await Car.findById(carId);
  if (!car) {
    return next(new ErrorResponse('Car not found', 404));
  }
  if (car.status === 'sold') {
    return next(new ErrorResponse('Car is already sold', 400));
  }

  // Create Razorpay order
  const options = {
    amount: amount,
    currency: currency || 'INR',
    receipt: `car_${carId}_${Date.now().toString().slice(-6)}`,
    notes: {
      carId: carId,
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

// @desc    Verify payment and update car status
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    carId
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

  // Get car details with seller information
  const car = await Car.findById(carId).populate('seller', 'name email');
  if (!car) {
    return next(new ErrorResponse('Car not found', 404));
  }

  // Get buyer details
  const buyer = await User.findById(req.user.id);
  if (!buyer) {
    return next(new ErrorResponse('Buyer not found', 404));
    console.log(buyer);
  }

  // Update car status to sold
  const updatedCar = await Car.findByIdAndUpdate(
    carId,
    {
      status: 'sold',
      soldTo: req.user.id,
      soldAt: Date.now()
    },
    { new: true }
  );

  console.log('Car status updated successfully:', updatedCar);
  // Create notifications
  const notifications = [
    // Notification for buyer
    {
      user: req.user.id,
      title: 'Purchase Successful! 🎉',
      description: `You have successfully purchased ${car.year} ${car.make} ${car.model}. Order ID: ${razorpay_order_id}`,
      type: 'purchase'
    },
    // Notification for seller
    {
      user: car.seller._id,
      title: 'Car Sold! 🎉',
      description: `Your ${car.year} ${car.make} ${car.model} has been sold to ${buyer.name}. Order ID: ${razorpay_order_id}`,
      type: 'sale'
    },
    // Notification for admin
    {
      user: (await User.findOne({ role: 'admin' }))._id,
      title: 'New Car Sale Completed! 🚗',
      description: `A new sale has been completed for ${car.year} ${car.make} ${car.model}. Buyer: ${buyer.name}, Seller: ${car.seller.name}. Order ID: ${razorpay_order_id}`,
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

  // Send emails only if mailer is configured
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.EMAIL_FROM && process.env.EMAIL_PASS) {
    try {
      const emailPromises = [];
      
      if (buyer.email) {
        const buyerEmailText = `
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
                <h1>🎉 Purchase Successful!</h1>
              </div>
              <div class="content">
                <p>Dear ${buyer.name},</p>
                <p>Congratulations on your new car purchase! We're excited to welcome you to the WheelsTrust family.</p>
                
                <div class="details">
                  <h2>Purchase Details</h2>
                  <p><strong>Car:</strong> ${car.year} ${car.make} ${car.model}</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount Paid:</strong> ₹${car.price.toLocaleString()}</p>
                </div>

                <p>Next Steps:</p>
                <ul>
                  <li>Our team will contact you within 24 hours to arrange the delivery</li>
                  <li>Please keep your payment receipt for reference</li>
                  <li>You can track your purchase status in your dashboard</li>
                </ul>

                <a href="${process.env.FRONTEND_URL}/dashboard/purchases" class="button">View Purchase Details</a>
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
          sendMail(buyer.email, '🎉 Congratulations on Your New Car! - WheelsTrust', buyerEmailText)
        );
      }
      
      if (car.seller.email) {
        const sellerEmailText = `
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
                <h1>🎉 Your Car Has Been Sold!</h1>
              </div>
              <div class="content">
                <p>Dear ${car.seller.name},</p>
                <p>Great news! Your car has been successfully sold through WheelsTrust.</p>
                
                <div class="details">
                  <h2>Transaction Details</h2>
                  <p><strong>Car:</strong> ${car.year} ${car.make} ${car.model}</p>
                  <p><strong>Buyer:</strong> ${buyer.name}</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount:</strong> ₹${car.price.toLocaleString()}</p>
                </div>

                <p>Next Steps:</p>
                <ul>
                  <li>The payment will be processed and transferred to your account within 3-5 business days</li>
                  <li>Please prepare the car for handover</li>
                  <li>Our team will contact you to arrange the transfer process</li>
                </ul>

                <a href="${process.env.FRONTEND_URL}/dashboard/sales" class="button">View Sale Details</a>
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
          sendMail(car.seller.email, '🎉 Your Car Has Been Sold! - WheelsTrust', sellerEmailText)
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
                <h1>New Car Sale Completed</h1>
              </div>
              <div class="content">
                <p>A new car sale has been completed on WheelsTrust.</p>
                
                <div class="details">
                  <h2>Transaction Details</h2>
                  <p><strong>Car:</strong> ${car.year} ${car.make} ${car.model}</p>
                  <p><strong>Seller:</strong> ${car.seller.name} (${car.seller.email})</p>
                  <p><strong>Buyer:</strong> ${buyer.name} (${buyer.email})</p>
                  <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  <p><strong>Amount:</strong> ₹${car.price.toLocaleString()}</p>
                </div>

                <p>Please ensure all necessary documentation and transfer processes are completed.</p>
              </div>
              <div class="footer">
                <p>WheelsTrust Admin Dashboard</p>
              </div>
            </div>
          </body>
          </html>
        `;
        emailPromises.push(
          sendMail(process.env.ADMIN_EMAIL, 'New Car Sale - WheelsTrust', adminEmailText)
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
    message: 'Payment verified and car status updated',
    data: {
      carId: updatedCar._id,
      status: updatedCar.status,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    }
  });
}); 