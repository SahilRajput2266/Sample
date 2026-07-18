import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  roundTitle: { type: String, required: true, trim: true, maxlength: 160 },
  interviewType: { type: String, enum: ['Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Assignment', 'Other'], default: 'Video' },
  interviewDate: { type: Date, required: true, index: true },
  interviewerName: { type: String, trim: true, maxlength: 160, default: '' },
  interviewerEmail: { type: String, trim: true, lowercase: true, default: '', match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Interviewer email is invalid'] },
  meetingLink: { type: String, trim: true, default: '', validate: { validator: (value) => !value || /^https?:\/\//i.test(value), message: 'meetingLink must be an HTTP(S) URL' } },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
  feedback: { type: String, trim: true, maxlength: 5000, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, applicationId: 1, interviewDate: 1 });
export default mongoose.model('ApplicationInterview', schema);
