const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = require('./app');
const connectDB = require('./config/db');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dquspyuhw',
  api_key: '224371911834243',
  api_secret:'kQN3bU5w3sftEEi4LsNkbUAdCLM'
});
// Connect to database
connectDB();

const PORT = process.env.PORT || 5005;

// Mount routers
// app.use('/api/v1/service-providers', serviceProviderRoutes);
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
    res.status(500).json({ error: 'Failed to delete image' });
  }
});
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 