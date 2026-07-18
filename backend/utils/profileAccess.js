import mongoose from 'mongoose';
import User from '../models/User.js';

export const resolveProfileUserId = async (req) => {
  if (req.user.role !== 'admin' || !req.query.userId) return req.user._id;
  if (!mongoose.isValidObjectId(req.query.userId)) {
    const error = new Error('Invalid userId');
    error.statusCode = 400;
    throw error;
  }
  if (!(await User.exists({ _id: req.query.userId }))) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return req.query.userId;
};
