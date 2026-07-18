import express from 'express';
import { uploadResume } from '../services/resume.service.js';
import { validateResumeMetadata } from '../validators/profile.validators.js';
import { createResume, deleteResume, downloadResume, getResumes, setDefaultResume } from '../controllers/resume.controller.js';

const router = express.Router();

router.route('/resume')
  .get(getResumes)
  .post(uploadResume.single('resume'), validateResumeMetadata, createResume);
router.delete('/resume/:id', deleteResume);
router.patch('/resume/default/:id', setDefaultResume);
router.get('/resume/download/:id', downloadResume);

export default router;
