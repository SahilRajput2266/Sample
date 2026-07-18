const urlFields = new Set(['profilePhoto', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'website', 'credentialUrl']);
const isUrl = (value) => { try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol); } catch { return false; } };
const invalidDateRange = (body, start, end, currentFlag) => body[start] && body[end] && !body[currentFlag] && new Date(body[end]) < new Date(body[start]);

const validate = (required = [], options = {}) => (req, res, next) => {
  const missing = required.filter((field) => req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '');
  if (missing.length) return res.status(400).json({ message: `Required fields: ${missing.join(', ')}` });
  for (const field of urlFields) {
    if (req.body[field] && !isUrl(req.body[field])) return res.status(400).json({ message: `${field} must be a valid HTTP(S) URL` });
  }
  if (options.range && invalidDateRange(req.body, ...options.range)) return res.status(400).json({ message: 'End date must not be before start date' });
  if (options.years && req.body.startYear && req.body.endYear && Number(req.body.endYear) < Number(req.body.startYear)) return res.status(400).json({ message: 'End year must not be before start year' });
  next();
};

export const validateProfile = validate();
export const validateSkill = validate(['skillName']);
export const validateExperience = validate(['companyName', 'designation', 'startDate'], { range: ['startDate', 'endDate', 'currentlyWorking'] });
export const validateEducation = validate(['degree', 'institute', 'startYear', 'endYear'], { years: true });
export const validateCertification = validate(['title', 'issuer', 'issueDate'], { range: ['issueDate', 'expiryDate', 'never'] });
export const validateLanguage = validate(['language']);
export const validateResumeMetadata = (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'Resume file is required' });
  next();
};
