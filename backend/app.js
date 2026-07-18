import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import skillRoutes from './routes/skill.routes.js';
import experienceRoutes from './routes/experience.routes.js';
import educationRoutes from './routes/education.routes.js';
import certificationRoutes from './routes/certification.routes.js';
import languageRoutes from './routes/language.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import { protect } from './middleware/auth.js';
import jobPreferenceRoutes from './routes/job-preference.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import aiRoutes from './routes/ai.routes.js';
import generatedDocumentRoutes from './routes/generated-document.routes.js';
import automationRoutes from './routes/automation.routes.js';
import automationAdminRoutes from './routes/automation-admin.routes.js';
import testApplicationRoutes from './routes/test-application.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', protect, profileRoutes, skillRoutes, experienceRoutes, educationRoutes, certificationRoutes, languageRoutes, resumeRoutes);
app.use('/api/job-preferences', protect, jobPreferenceRoutes);
app.use('/api/jobs', protect, jobRoutes);
app.use('/api/applications', protect, applicationRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/generated-documents', protect, generatedDocumentRoutes);
app.use('/api/automation', protect, automationRoutes);
app.use('/api/admin/automation', protect, automationAdminRoutes);

if (process.env.AUTOMATION_TEST_FORM_ENABLED === 'true' && process.env.NODE_ENV !== 'production') app.use('/test-job-application', testApplicationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('JobOrbit API is running');
});

// Error handling middleware
app.use(errorHandler);

export default app;
