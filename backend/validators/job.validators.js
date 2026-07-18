import { JOB_STATUSES } from '../models/Job.js';

const arrayFields = ['targetRoles', 'skills', 'preferredLocations', 'preferredIndustries', 'excludeCompanies', 'keywords'];
export const validateJobPreferences = (req, res, next) => {
  for (const field of arrayFields) {
    if (req.body[field] !== undefined && !Array.isArray(req.body[field])) return res.status(400).json({ message: `${field} must be an array` });
  }
  const minSalary = Number(req.body.minSalary || 0), maxSalary = Number(req.body.maxSalary || 0);
  if (minSalary < 0 || maxSalary < 0 || (maxSalary && minSalary > maxSalary)) return res.status(400).json({ message: 'Salary range is invalid' });
  const minExperience = Number(req.body.minExperience || 0), maxExperience = Number(req.body.maxExperience || 0);
  if (minExperience < 0 || maxExperience < 0 || (maxExperience && minExperience > maxExperience)) return res.status(400).json({ message: 'Experience range is invalid' });
  next();
};

export const validateJobStatus = (req, res, next) => {
  if (!JOB_STATUSES.includes(req.body.status)) return res.status(400).json({ message: `status must be one of: ${JOB_STATUSES.join(', ')}` });
  next();
};

export const validateJobQuery = (req, res, next) => {
  const page = Number(req.query.page || 1), limit = Number(req.query.limit || 12), match = Number(req.query.minMatchScore || 0);
  if (!Number.isInteger(page) || page < 1) return res.status(400).json({ message: 'page must be a positive integer' });
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ message: 'limit must be between 1 and 100' });
  if (match < 0 || match > 100) return res.status(400).json({ message: 'minMatchScore must be between 0 and 100' });
  if (req.query.status && !JOB_STATUSES.includes(req.query.status)) return res.status(400).json({ message: 'Invalid job status filter' });
  for (const field of ['salaryMin', 'salaryMax']) if (req.query[field] !== undefined && (!Number.isFinite(Number(req.query[field])) || Number(req.query[field]) < 0)) return res.status(400).json({ message: `${field} must be a non-negative number` });
  if (req.query.remoteType && !['Remote', 'Hybrid', 'Onsite'].includes(req.query.remoteType)) return res.status(400).json({ message: 'Invalid remoteType filter' });
  if (req.query.sort && !['newest', 'oldest', 'salary-desc', 'salary-asc', 'match-asc', 'match-desc'].includes(req.query.sort)) return res.status(400).json({ message: 'Invalid sort option' });
  next();
};
