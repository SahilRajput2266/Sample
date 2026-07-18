import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Certification from '../models/Certification.js';
import Language from '../models/Language.js';
import Resume from '../models/Resume.js';
import { removeResumeFile } from '../services/resume.service.js';
import JobPreference from '../models/JobPreference.js';
import Job from '../models/Job.js';
import SavedJob from '../models/SavedJob.js';
import JobActivity from '../models/JobActivity.js';
import Application from '../models/Application.js';
import ApplicationNote from '../models/ApplicationNote.js';
import ApplicationInterview from '../models/ApplicationInterview.js';
import ApplicationDocument from '../models/ApplicationDocument.js';
import ApplicationActivity from '../models/ApplicationActivity.js';
import GeneratedDocument from '../models/GeneratedDocument.js';
import AIRequest from '../models/AIRequest.js';
import ResumeOptimization from '../models/ResumeOptimization.js';
import AutomationProfile from '../models/AutomationProfile.js';
import AutomationRun from '../models/AutomationRun.js';
import AutomationStep from '../models/AutomationStep.js';
import AutomationAnswer from '../models/AutomationAnswer.js';
import AutomationScreenshot from '../models/AutomationScreenshot.js';
import AutomationConsent from '../models/AutomationConsent.js';
import { normalizeEmail, emailLookupFilter } from '../utils/email.js';

// True when `user` is the only remaining active admin account.
const isLastActiveAdmin = async (user) => {
  if (user.role !== 'admin' || !user.isActive) return false;
  const otherActiveAdmins = await User.countDocuments({
    _id: { $ne: user._id },
    role: 'admin',
    isActive: true,
  });
  return otherActiveAdmins === 0;
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const normalUsers = await User.countDocuments({ role: 'user' });
    
    // Recent 5 users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      normalUsers,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { fullName, password, role, isActive, plan } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email) {
      res.status(400);
      throw new Error('Please add a valid email');
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
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      plan: plan || 'free'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (req.body.email !== undefined) {
        const email = normalizeEmail(req.body.email);
        if (!email) {
          res.status(400);
          throw new Error('Please add a valid email');
        }
        user.email = email;
      }

      // Guard: never demote or deactivate the final active admin.
      const demoting = req.body.role && req.body.role !== 'admin';
      const deactivating = req.body.isActive === false;
      if ((demoting || deactivating) && (await isLastActiveAdmin(user))) {
        res.status(400);
        throw new Error('Cannot demote or deactivate the last active admin');
      }

      user.fullName = req.body.fullName || user.fullName;
      user.role = req.body.role || user.role;
      user.plan = req.body.plan || user.plan;

      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        plan: updatedUser.plan
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (req.body.isActive === false && (await isLastActiveAdmin(user))) {
        res.status(400);
        throw new Error('Cannot demote or deactivate the last active admin');
      }
      user.isActive = req.body.isActive;
      const updatedUser = await user.save();
      res.json({ _id: updatedUser._id, isActive: updatedUser.isActive });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
         res.status(400);
         throw new Error('Cannot delete admin user');
      }
      const resumes = await Resume.find({ userId: user._id }).select('storedFileName').lean();
      await User.deleteOne({ _id: req.params.id });
      await Promise.all([
        Profile.deleteMany({ userId: user._id }),
        Skill.deleteMany({ userId: user._id }),
        Experience.deleteMany({ userId: user._id }),
        Education.deleteMany({ userId: user._id }),
        Certification.deleteMany({ userId: user._id }),
        Language.deleteMany({ userId: user._id }),
        Resume.deleteMany({ userId: user._id }),
        JobPreference.deleteMany({ userId: user._id }),
        Job.deleteMany({ userId: user._id }),
        SavedJob.deleteMany({ userId: user._id }),
        JobActivity.deleteMany({ userId: user._id }),
        Application.deleteMany({ userId: user._id }),
        ApplicationNote.deleteMany({ userId: user._id }),
        ApplicationInterview.deleteMany({ userId: user._id }),
        ApplicationDocument.deleteMany({ userId: user._id }),
        ApplicationActivity.deleteMany({ userId: user._id }),
        GeneratedDocument.deleteMany({ userId: user._id }),
        AIRequest.deleteMany({ userId: user._id }),
        ResumeOptimization.deleteMany({ userId: user._id }),
        AutomationProfile.deleteMany({ userId: user._id }),
        AutomationRun.deleteMany({ userId: user._id }),
        AutomationStep.deleteMany({ userId: user._id }),
        AutomationAnswer.deleteMany({ userId: user._id }),
        AutomationScreenshot.deleteMany({ userId: user._id }),
        AutomationConsent.deleteMany({ userId: user._id }),
      ]);
      await Promise.allSettled(resumes.map((resume) => removeResumeFile(resume.storedFileName)));
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.password = req.body.password;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
