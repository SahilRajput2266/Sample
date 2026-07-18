import mongoose from 'mongoose';

const validId = (value) => !value || mongoose.isValidObjectId(value);
const validateIds = (req, res) => {
  req.body ||= {};
  for (const field of ['jobId', 'applicationId', 'resumeId']) if (!validId(req.body[field])) { res.status(400).json({ message: `${field} is invalid` }); return false; }
  return true;
};
export const validateCoverLetter = (req, res, next) => { if (!validateIds(req, res)) return; if (!req.body.jobId && !req.body.applicationId) return res.status(400).json({ message: 'jobId or applicationId is required' }); if (req.body.tone && !['professional','friendly','confident'].includes(req.body.tone)) return res.status(400).json({ message: 'Invalid tone' }); if (req.body.length && !['short','medium','detailed'].includes(req.body.length)) return res.status(400).json({ message: 'Invalid length' }); next(); };
export const validateResumeSummary = (req, res, next) => { if (!validateIds(req, res)) return; next(); };
export const validateResumeOptimization = (req, res, next) => { if (!validateIds(req, res)) return; if (!req.body.resumeId || !req.body.jobId) return res.status(400).json({ message: 'resumeId and jobId are required' }); next(); };
export const validateJobFit = (req, res, next) => { if (!validateIds(req, res)) return; if (!req.body.jobId) return res.status(400).json({ message: 'jobId is required' }); next(); };
export const validateInterviewQuestions = (req, res, next) => { if (!validateIds(req, res)) return; if (!req.body.jobId && !req.body.applicationId) return res.status(400).json({ message: 'jobId or applicationId is required' }); next(); };
export const validateFollowUp = (req, res, next) => { if (!validateIds(req, res)) return; if (!req.body.applicationId) return res.status(400).json({ message: 'applicationId is required' }); if (!['after_apply','after_interview','reminder'].includes(req.body.followUpType)) return res.status(400).json({ message: 'Invalid followUpType' }); next(); };
export const validateGeneratedDocumentUpdate = (req, res, next) => { req.body ||= {}; if (req.body.title !== undefined && !req.body.title.trim()) return res.status(400).json({ message: 'title cannot be empty' }); if (req.body.content !== undefined && !req.body.content.trim()) return res.status(400).json({ message: 'content cannot be empty' }); next(); };
