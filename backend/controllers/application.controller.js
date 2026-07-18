import Application from '../models/Application.js';
import ApplicationNote from '../models/ApplicationNote.js';
import ApplicationInterview from '../models/ApplicationInterview.js';
import ApplicationDocument from '../models/ApplicationDocument.js';
import ApplicationActivity from '../models/ApplicationActivity.js';
import Job from '../models/Job.js';
import JobActivity from '../models/JobActivity.js';
import Resume from '../models/Resume.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const fields = ['company','role','location','source','applyUrl','status','priority','appliedAt','followUpDate','resumeId','coverLetterId','expectedSalary','contactPerson','contactEmail','notes'];
const owned = async (req) => ({ _id: req.params.id, userId: await resolveProfileUserId(req) });
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const verifyResume = async (userId, resumeId) => {
  if (!resumeId) return;
  if (!(await Resume.exists({ _id: resumeId, userId }))) { const error = new Error('Resume not found'); error.statusCode = 404; throw error; }
};
const log = (application, action, extra = {}) => ApplicationActivity.create({ userId: application.userId, applicationId: application._id, action, oldStatus: extra.oldStatus || '', newStatus: extra.newStatus || application.status, metadata: extra.metadata || {} });

export const listApplications = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req), filter = { userId };
    if (req.query.search) filter.$text = { $search: String(req.query.search).slice(0, 100) };
    for (const field of ['status', 'priority']) if (req.query[field]) filter[field] = req.query[field];
    if (req.query.company) filter.company = { $regex: escapeRegex(req.query.company), $options: 'i' };
    if (req.query.role) filter.role = { $regex: escapeRegex(req.query.role), $options: 'i' };
    const sorts = { 'applied-desc': { appliedAt: -1, createdAt: -1 }, 'applied-asc': { appliedAt: 1 }, 'followup-asc': { followUpDate: 1 }, 'followup-desc': { followUpDate: -1 }, status: { status: 1, updatedAt: -1 }, newest: { createdAt: -1 } };
    const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20), sort = sorts[req.query.sort] || sorts.newest;
    const [applications, total] = await Promise.all([Application.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('resumeId', 'title originalFileName').lean(), Application.countDocuments(filter)]);
    res.json({ applications, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
};

export const createApplication = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    await verifyResume(userId, req.body.resumeId);
    const data = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const application = await Application.create({ ...data, userId, source: data.source || 'manual', appliedAt: data.appliedAt || (data.status === 'applied' ? new Date() : undefined) });
    await log(application, 'created', { newStatus: application.status, metadata: { source: application.source } });
    res.status(201).json(application);
  } catch (error) { next(error); }
};

export const createApplicationFromJob = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req), job = await Job.findOne({ _id: req.params.jobId, userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (await Application.exists({ userId, jobId: job._id })) return res.status(409).json({ message: 'An application already exists for this job' });
    const body = req.body || {};
    await verifyResume(userId, body.resumeId);
    const status = ['started', 'applied'].includes(body.status) ? body.status : 'started';
    const application = await Application.create({ userId, jobId: job._id, company: job.company, role: job.title, location: job.location, source: job.source, applyUrl: job.applyUrl, status, priority: body.priority || 'medium', resumeId: body.resumeId, expectedSalary: body.expectedSalary || 0, appliedAt: status === 'applied' ? new Date() : undefined });
    const oldJobStatus = job.status;
    job.status = status;
    await job.save();
    await Promise.all([log(application, 'created', { newStatus: status, metadata: { jobId: job._id } }), JobActivity.create({ userId, jobId: job._id, action: status === 'started' ? 'apply_started' : 'status_changed', oldStatus: oldJobStatus, newStatus: status, metadata: { applicationId: application._id } })]);
    res.status(201).json(application);
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'An application already exists for this job' }); next(error); }
};

export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne(await owned(req)).populate('resumeId', 'title originalFileName fileUrl').populate('jobId', 'title company matchScore status').lean();
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) { next(error); }
};

export const updateApplication = async (req, res, next) => {
  try {
    const filter = await owned(req), application = await Application.findOne(filter);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await verifyResume(application.userId, req.body.resumeId);
    const oldStatus = application.status;
    for (const field of fields) if (req.body[field] !== undefined) application[field] = req.body[field];
    if (application.status === 'applied' && !application.appliedAt) application.appliedAt = new Date();
    await application.save();
    await log(application, oldStatus !== application.status ? 'status_changed' : 'updated', { oldStatus, newStatus: application.status });
    res.json(application);
  } catch (error) { next(error); }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne(await owned(req));
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const oldStatus = application.status;
    application.status = req.body.status;
    if (application.status === 'applied' && !application.appliedAt) application.appliedAt = new Date();
    await application.save();
    await log(application, 'status_changed', { oldStatus, newStatus: application.status, metadata: req.body.metadata });
    if (application.jobId && ['saved','started','applied','interview','rejected'].includes(application.status)) await Job.updateOne({ _id: application.jobId, userId: application.userId }, { $set: { status: application.status } });
    res.json(application);
  } catch (error) { next(error); }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete(await owned(req));
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await Promise.all([ApplicationNote.deleteMany({ userId: application.userId, applicationId: application._id }), ApplicationInterview.deleteMany({ userId: application.userId, applicationId: application._id }), ApplicationDocument.deleteMany({ userId: application.userId, applicationId: application._id }), ApplicationActivity.deleteMany({ userId: application.userId, applicationId: application._id })]);
    res.json({ message: 'Application deleted' });
  } catch (error) { next(error); }
};

export const getApplicationAnalytics = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req), now = new Date();
    const [total, grouped, followUpsDue, recentApplications] = await Promise.all([
      Application.countDocuments({ userId }), Application.aggregate([{ $match: { userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.countDocuments({ userId, followUpDate: { $lte: now }, status: { $nin: ['offer','rejected','withdrawn'] } }),
      Application.find({ userId }).sort('-updatedAt').limit(5).select('company role status priority appliedAt followUpDate updatedAt').lean(),
    ]);
    const counts = Object.fromEntries(grouped.map((item) => [item._id, item.count]));
    const responded = (counts.screening || 0) + (counts.interview || 0) + (counts.assignment || 0) + (counts.offer || 0) + (counts.rejected || 0);
    const submitted = total - (counts.saved || 0) - (counts.started || 0);
    res.json({ totalApplications: total, applied: counts.applied || 0, interviews: counts.interview || 0, offers: counts.offer || 0, rejected: counts.rejected || 0, followUpsDue, responseRate: submitted ? Math.round(responded / submitted * 100) : 0, statusCounts: counts, recentApplications });
  } catch (error) { next(error); }
};
