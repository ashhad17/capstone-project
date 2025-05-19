// api-gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api/v1/auth', createProxyMiddleware({ target: 'http://auth-service:5008', changeOrigin: true }));
app.use('/api/v1/users', createProxyMiddleware({ target: 'http://user-service:5007', changeOrigin: true }));
app.use('/api/v1/bookings', createProxyMiddleware({ target: 'http://booking-service:5001', changeOrigin: true }));
app.use('/api/v1/cars', createProxyMiddleware({ target: 'http://cars-service:5002', changeOrigin: true }));
app.use('/api/v1/notifications', createProxyMiddleware({ target: 'http://notifications-service:5003', changeOrigin: true }));
app.use('/api/v1/service-providers', createProxyMiddleware({ target: 'http://serviceProvider-service:5005', changeOrigin: true }));
app.use('/api/v1/review', createProxyMiddleware({ target: 'http://review-service:5004', changeOrigin: true }));
app.use('/api/v1/services', createProxyMiddleware({ target: 'http://services-service:5006', changeOrigin: true }));
// Add more services...

app.listen(5000, () => console.log('API Gateway running on port 5000'));
