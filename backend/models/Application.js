import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['saved', 'started', 'applied', 'screening', 'interview', 'assignment', 'offer', 'rejected', 'withdrawn'];
export const APPLICATION_PRIORITIES = ['low', 'medium', 'high'];

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true },
  company: { type: String, required: true, trim: true, maxlength: 200 },
  role: { type: String, required: true, trim: true, maxlength: 200 },
  location: { type: String, trim: true, maxlength: 160, default: '' },
  source: { type: String, trim: true, maxlength: 100, default: 'manual' },
  applyUrl: { type: String, trim: true, default: '', validate: { validator: (value) => !value || /^https?:\/\//i.test(value), message: 'applyUrl must be an HTTP(S) URL' } },
  status: { type: String, enum: APPLICATION_STATUSES, default: 'saved', index: true },
  priority: { type: String, enum: APPLICATION_PRIORITIES, default: 'medium', index: true },
  appliedAt: Date,
  followUpDate: { type: Date, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  coverLetterId: mongoose.Schema.Types.ObjectId,
  expectedSalary: { type: Number, min: 0, default: 0 },
  contactPerson: { type: String, trim: true, maxlength: 160, default: '' },
  contactEmail: { type: String, trim: true, lowercase: true, default: '', match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Contact email is invalid'] },
  notes: { type: String, trim: true, maxlength: 5000, default: '' },
}, { timestamps: true });

schema.index({ userId: 1, jobId: 1 }, { unique: true, partialFilterExpression: { jobId: { $type: 'objectId' } } });
schema.index({ userId: 1, status: 1, updatedAt: -1 });
schema.index({ userId: 1, company: 1, role: 1 });
schema.index({ company: 'text', role: 'text', notes: 'text' });
export default mongoose.model('Application', schema);
