// api-gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
//app.use(express.json());

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dquspyuhw',
  api_key: '224371911834243',
  api_secret:'kQN3bU5w3sftEEi4LsNkbUAdCLM'
});
// Connect to database
// connectDB();


app.delete('/api/v1/delete-image', async (req, res) => {
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

app.use('/api/v1/auth', createProxyMiddleware({ target: 'http://auth-service:5008/api/v1/auth', changeOrigin: true }));
app.use('/api/v1/users', createProxyMiddleware({ target: 'http://user-service:5007/api/v1/users', changeOrigin: true }));
app.use('/api/v1/bookings', createProxyMiddleware({ target: 'http://booking-service:5001/api/v1/bookings', changeOrigin: true }));
app.use('/api/v1/cars', createProxyMiddleware({ target: 'http://cars-service:5002/api/v1/cars', changeOrigin: true }));
app.use('/api/v1/notifications', createProxyMiddleware({ target: 'http://notifications-service:5003/api/v1/notifications', changeOrigin: true }));
app.use('/api/v1/service-providers', createProxyMiddleware({ target: 'http://serviceprovider-service:5005/api/v1/service-providers', changeOrigin: true }));
app.use('/api/v1/review', createProxyMiddleware({ target: 'http://review-service:5004/api/v1/review', changeOrigin: true }));
app.use('/api/v1/services', createProxyMiddleware({ target: 'http://services-service:5006/api/v1/services', changeOrigin: true }));
app.use('/api/v1/payments', createProxyMiddleware({ target: 'http://payment-service:5009/api/v1/payments', changeOrigin: true }));
// Add more services...


// const { createProxyMiddleware } = require('http-proxy-middleware');

// app.use('/api/v1/auth', createProxyMiddleware({
//     target: 'http://localhost:5008/api/v1/auth',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/users', createProxyMiddleware({
//     target: 'http://localhost:5007/api/v1/users',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/bookings', createProxyMiddleware({
//     target: 'http://localhost:5001/api/v1/bookings',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/cars', createProxyMiddleware({
//     target: 'http://localhost:5002/api/v1/cars',
//     changeOrigin: true,
//   }));
//   app.use('/api/v1/notifications', createProxyMiddleware({
//     target: 'http://localhost:5003/api/v1/notifications',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/service-providers', createProxyMiddleware({
//     target: 'http://localhost:5005/api/v1/service-providers',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/review', createProxyMiddleware({
//     target: 'http://localhost:5004/api/v1/review',
//     changeOrigin: true
//   }));
  
//   app.use('/api/v1/services', createProxyMiddleware({
//     target: 'http://localhost:5006/api/v1/services',
//     changeOrigin: true
//   }));
app.listen(5000, () => console.log('API Gateway running on port 5000'));
