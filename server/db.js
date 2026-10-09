import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/water_manager';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`====================================================`);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log(`====================================================`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log(`Please check MONGODB_URI in your .env file.`);
  }
};
