import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@joborbit.com' });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit(1);
    }

    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@joborbit.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
      plan: 'premium',
    });

    await adminUser.save();
    console.log('Admin user seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
