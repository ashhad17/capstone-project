require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://ashhad17:ashhad2105@cluster0.j3sdp.mongodb.net/wheelstrust',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads'
}; 