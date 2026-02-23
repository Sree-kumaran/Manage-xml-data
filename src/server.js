const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// Middleware
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch(err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);        
  }
};

connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});