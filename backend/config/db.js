// backend/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set in .env');
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // no extra log here, server logs connection
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    throw err;
  }
}
module.exports = connectDB;
