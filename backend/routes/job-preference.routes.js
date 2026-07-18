import express from 'express';
import { deleteJobPreferences, getJobPreferences, updateJobPreferences } from '../controllers/job-preference.controller.js';
import { validateJobPreferences } from '../validators/job.validators.js';
const router = express.Router();
router.route('/').get(getJobPreferences).put(validateJobPreferences, updateJobPreferences).delete(deleteJobPreferences);
export default router;
