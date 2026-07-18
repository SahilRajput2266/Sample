import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { normalizeEmail, emailLookupFilter } from '../utils/email.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email) {
      res.status(400);
      throw new Error('Please add a valid email');
    }
    if (typeof password !== 'string' || typeof fullName !== 'string') {
      res.status(400);
      throw new Error('Invalid user data');
    }

    const userExists = await User.findOne(emailLookupFilter(email));
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || typeof password !== 'string') {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const user = await User.findOne(emailLookupFilter(email)).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        res.status(401);
        throw new Error('Account is inactive');
      }
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
