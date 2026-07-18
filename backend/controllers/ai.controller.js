import AIRequest from '../models/AIRequest.js';
import { generateDocument } from '../services/ai/document-generator.service.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const handler = (feature) => async (req, res, next) => { try { res.status(201).json(await generateDocument(req.user._id, feature, req.body)); } catch (error) { next(error); } };
export const generateCoverLetter = handler('cover_letter');
export const generateResumeSummary = handler('resume_summary');
export const optimizeResume = handler('resume_optimization');
export const analyzeJobFit = handler('job_fit_analysis');
export const generateInterviewQuestions = handler('interview_questions');
export const generateFollowUpEmail = handler('follow_up_email');

export const getAILogs = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') filter.userId = req.user._id;
    else if (req.query.userId) filter.userId = await resolveProfileUserId(req);
    const page = Math.max(1, Number(req.query.page || 1)), limit = Math.min(100, Math.max(1, Number(req.query.limit || 30)));
    const [logs, total] = await Promise.all([AIRequest.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(), AIRequest.countDocuments(filter)]);
    res.json({ logs, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
};
