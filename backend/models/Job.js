import mongoose from 'mongoose';

export const JOB_STATUSES = ['new', 'saved', 'ignored', 'started', 'applied', 'interview', 'rejected'];

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  company: { type: String, required: true, trim: true, maxlength: 200 },
  companyLogo: { type: String, trim: true, default: '', validate: { validator: (value) => !value || /^https?:\/\//i.test(value), message: 'companyLogo must be an HTTP(S) URL' } },
  location: { type: String, trim: true, maxlength: 160, default: '' },
  country: { type: String, trim: true, maxlength: 100, default: '' },
  remoteType: { type: String, enum: ['Remote', 'Hybrid', 'Onsite'], default: 'Onsite' },
  salaryMin: { type: Number, min: 0, default: 0 },
  salaryMax: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, trim: true, maxlength: 3, default: 'INR' },
  experienceMin: { type: Number, min: 0, max: 80, default: 0 },
  experienceMax: { type: Number, min: 0, max: 80, default: 0 },
  skills: [{ type: String, trim: true, maxlength: 80 }],
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], default: 'Full-time' },
  industry: { type: String, trim: true, maxlength: 120, default: '' },
  source: { type: String, required: true, trim: true, maxlength: 80 },
  sourceJobId: { type: String, trim: true },
  applyUrl: { type: String, required: true, trim: true, match: [/^https?:\/\//i, 'applyUrl must be an HTTP(S) URL'] },
  description: { type: String, required: true, trim: true, maxlength: 12000 },
  responsibilities: [{ type: String, trim: true, maxlength: 1000 }],
  requirements: [{ type: String, trim: true, maxlength: 1000 }],
  benefits: [{ type: String, trim: true, maxlength: 500 }],
  postedAt: { type: Date, required: true, index: true },
  expiresAt: Date,
  matchScore: { type: Number, min: 0, max: 100, default: 0, index: true },
  matchReasons: [{ type: String, trim: true, maxlength: 300 }],
  missingSkills: [{ type: String, trim: true, maxlength: 80 }],
  status: { type: String, enum: JOB_STATUSES, default: 'new', index: true },
}, { timestamps: true });

schema.index({ userId: 1, source: 1, sourceJobId: 1 }, { unique: true, partialFilterExpression: { sourceJobId: { $type: 'string' } } });
schema.index({ userId: 1, title: 1, company: 1, applyUrl: 1 }, { unique: true, partialFilterExpression: { sourceJobId: { $exists: false } } });
schema.index({ userId: 1, status: 1, matchScore: -1 });
schema.index({ userId: 1, source: 1, postedAt: -1 });
schema.index({ title: 'text', company: 'text', description: 'text' });

export default mongoose.model('Job', schema);
