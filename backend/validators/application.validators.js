import { APPLICATION_PRIORITIES, APPLICATION_STATUSES } from '../models/Application.js';

const validDate = (value) => !value || !Number.isNaN(new Date(value).getTime());
export const validateApplication = (req, res, next) => {
  if (!req.body.company?.trim() || !req.body.role?.trim()) return res.status(400).json({ message: 'company and role are required' });
  if (req.body.status && !APPLICATION_STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status' });
  if (req.body.priority && !APPLICATION_PRIORITIES.includes(req.body.priority)) return res.status(400).json({ message: 'Invalid application priority' });
  if (!validDate(req.body.appliedAt) || !validDate(req.body.followUpDate)) return res.status(400).json({ message: 'Application dates are invalid' });
  if (req.body.expectedSalary !== undefined && Number(req.body.expectedSalary) < 0) return res.status(400).json({ message: 'expectedSalary cannot be negative' });
  next();
};
export const validateApplicationUpdate = (req, res, next) => {
  if (req.body.status && !APPLICATION_STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status' });
  if (req.body.priority && !APPLICATION_PRIORITIES.includes(req.body.priority)) return res.status(400).json({ message: 'Invalid application priority' });
  if (!validDate(req.body.appliedAt) || !validDate(req.body.followUpDate)) return res.status(400).json({ message: 'Application dates are invalid' });
  next();
};
export const validateApplicationStatus = (req, res, next) => {
  if (!APPLICATION_STATUSES.includes(req.body.status)) return res.status(400).json({ message: `status must be one of: ${APPLICATION_STATUSES.join(', ')}` });
  next();
};
export const validateApplicationQuery = (req, res, next) => {
  const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ message: 'Invalid pagination parameters' });
  if (req.query.status && !APPLICATION_STATUSES.includes(req.query.status)) return res.status(400).json({ message: 'Invalid status filter' });
  if (req.query.priority && !APPLICATION_PRIORITIES.includes(req.query.priority)) return res.status(400).json({ message: 'Invalid priority filter' });
  next();
};
export const validateNote = (req, res, next) => req.body.note?.trim() ? next() : res.status(400).json({ message: 'note is required' });
export const validateInterview = (req, res, next) => {
  if (!req.body.roundTitle?.trim() || !validDate(req.body.interviewDate) || !req.body.interviewDate) return res.status(400).json({ message: 'roundTitle and a valid interviewDate are required' });
  next();
};
export const validateDocument = (req, res, next) => {
  if (!req.body.documentType || !['resume','cover_letter','portfolio','assignment','other'].includes(req.body.documentType)) return res.status(400).json({ message: 'Valid documentType is required' });
  if (!req.body.title?.trim() && !req.body.resumeId) return res.status(400).json({ message: 'title or resumeId is required' });
  next();
};
