import express from 'express';
import {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetUserPassword
} from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply protect and admin middleware to all routes in this file
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);

export default router;
