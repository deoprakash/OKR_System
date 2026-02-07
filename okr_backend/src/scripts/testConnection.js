import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI not set in environment');
  process.exit(1);
}

async function test() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB (test)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    process.exit(1);
  }
}

test();
