import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { EMAIL_REGEX } from '../utils/email.js';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: 120,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [EMAIL_REGEX, 'Please add a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  plan: {
    type: String,
    enum: ['free', 'trial', 'premium'],
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'expired', 'cancelled'],
    default: 'inactive',
  },
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  maxDailyJobFetchLimit: {
    type: Number,
    default: 20,
  },
  maxApplicationsLimit: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
