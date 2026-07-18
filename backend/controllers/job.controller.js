import Job from '../models/Job.js';
import SavedJob from '../models/SavedJob.js';
import JobActivity from '../models/JobActivity.js';
import JobPreference from '../models/JobPreference.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';
import { fetchAndStoreJobs } from '../services/job-fetch.service.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const jobForUser = async (req) => ({ _id: req.params.id, userId: await resolveProfileUserId(req) });

export const listJobs = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const filter = { userId };
    if (req.query.search) filter.$text = { $search: String(req.query.search).slice(0, 100) };
    if (req.query.location) filter.location = { $regex: escapeRegex(req.query.location), $options: 'i' };
    for (const field of ['remoteType', 'jobType', 'source', 'status']) if (req.query[field]) filter[field] = req.query[field];
    if (req.query.minMatchScore) filter.matchScore = { $gte: Number(req.query.minMatchScore) };
    if (req.query.salaryMin) filter.salaryMax = { $gte: Number(req.query.salaryMin) };
    if (req.query.salaryMax) filter.salaryMin = { $lte: Number(req.query.salaryMax) };
    if (req.query.skills) filter.skills = { $in: String(req.query.skills).split(',').filter(Boolean).map((skill) => new RegExp(`^${escapeRegex(skill.trim())}$`, 'i')) };

    const page = Number(req.query.page || 1), limit = Number(req.query.limit || 12);
    const sorts = { newest: { postedAt: -1 }, oldest: { postedAt: 1 }, 'salary-desc': { salaryMax: -1 }, 'salary-asc': { salaryMin: 1 }, 'match-asc': { matchScore: 1 }, 'match-desc': { matchScore: -1, postedAt: -1 } };
    const sort = sorts[req.query.sort] || sorts['match-desc'];
    const [jobs, total] = await Promise.all([Job.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(), Job.countDocuments(filter)]);
    res.json({ jobs, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
};

export const fetchJobs = async (req, res, next) => {
  try { res.json(await fetchAndStoreJobs(await resolveProfileUserId(req))); }
  catch (error) { next(error); }
};

export const getJob = async (req, res, next) => {
  try {
    const filter = await jobForUser(req), job = await Job.findOne(filter).lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const isSaved = Boolean(await SavedJob.exists({ userId: filter.userId, jobId: job._id }));
    await JobActivity.create({ userId: filter.userId, jobId: job._id, action: 'viewed', oldStatus: job.status, newStatus: job.status });
    res.json({ ...job, isSaved });
  } catch (error) { next(error); }
};

export const updateJobStatus = async (req, res, next) => {
  try {
    const filter = await jobForUser(req), job = await Job.findOne(filter);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const oldStatus = job.status;
    job.status = req.body.status;
    await job.save();
    const action = job.status === 'ignored' ? 'ignored' : job.status === 'started' ? 'apply_started' : 'status_changed';
    await JobActivity.create({ userId: job.userId, jobId: job._id, action, oldStatus, newStatus: job.status, metadata: req.body.metadata || {} });
    res.json(job);
  } catch (error) { next(error); }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete(await jobForUser(req));
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await Promise.all([SavedJob.deleteMany({ userId: job.userId, jobId: job._id }), JobActivity.deleteMany({ userId: job.userId, jobId: job._id })]);
    res.json({ message: 'Job deleted' });
  } catch (error) { next(error); }
};

export const listSavedJobs = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const saved = await SavedJob.find({ userId }).sort('-savedAt').populate({ path: 'jobId' }).lean();
    res.json(saved.filter((item) => item.jobId));
  } catch (error) { next(error); }
};

export const saveJob = async (req, res, next) => {
  try {
    const filter = await jobForUser(req), job = await Job.findOne(filter);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const saved = await SavedJob.findOneAndUpdate({ userId: job.userId, jobId: job._id }, { $set: { notes: req.body?.notes || '' }, $setOnInsert: { savedAt: new Date() } }, { returnDocument: 'after', upsert: true, runValidators: true });
    const oldStatus = job.status;
    if (['new', 'ignored'].includes(job.status)) { job.status = 'saved'; await job.save(); }
    await JobActivity.create({ userId: job.userId, jobId: job._id, action: 'saved', oldStatus, newStatus: job.status });
    res.status(201).json(saved);
  } catch (error) { next(error); }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const filter = await jobForUser(req), job = await Job.findOne(filter);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const deleted = await SavedJob.findOneAndDelete({ userId: job.userId, jobId: job._id });
    if (!deleted) return res.status(404).json({ message: 'Saved job not found' });
    if (job.status === 'saved') { job.status = 'new'; await job.save(); }
    await JobActivity.create({ userId: job.userId, jobId: job._id, action: 'status_changed', oldStatus: 'saved', newStatus: job.status, metadata: { reason: 'unsaved' } });
    res.json({ message: 'Job removed from saved jobs' });
  } catch (error) { next(error); }
};

export const getJobActivity = async (req, res, next) => {
  try {
    const filter = await jobForUser(req);
    if (!(await Job.exists(filter))) return res.status(404).json({ message: 'Job not found' });
    res.json(await JobActivity.find({ userId: filter.userId, jobId: filter._id }).sort('-createdAt').lean());
  } catch (error) { next(error); }
};

export const getJobDashboardStats = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const [totalJobs, highMatchJobs, savedJobs, ignoredJobs, startedApplications, score, recentJobs, preferences] = await Promise.all([
      Job.countDocuments({ userId }), Job.countDocuments({ userId, matchScore: { $gte: 70 } }), SavedJob.countDocuments({ userId }),
      Job.countDocuments({ userId, status: 'ignored' }), Job.countDocuments({ userId, status: { $in: ['started', 'applied', 'interview'] } }),
      Job.aggregate([{ $match: { userId } }, { $group: { _id: null, average: { $avg: '$matchScore' } } }]),
      Job.find({ userId }).sort('-postedAt').limit(5).select('title company matchScore status postedAt').lean(), JobPreference.findOne({ userId }).lean(),
    ]);
    const preferenceComplete = Boolean(preferences?.targetRoles?.length && preferences?.skills?.length && (preferences.remoteOnly || preferences.hybridAllowed || preferences.onsiteAllowed));
    res.json({ totalJobs, highMatchJobs, savedJobs, ignoredJobs, startedApplications, averageMatchScore: Math.round(score[0]?.average || 0), recentJobs, preferenceComplete });
  } catch (error) { next(error); }
};
