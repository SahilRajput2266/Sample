import mongoose from 'mongoose';

export const GENERATED_DOCUMENT_TYPES = ['cover_letter', 'resume_summary', 'resume_optimization', 'job_fit_analysis', 'interview_questions', 'follow_up_email'];
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },
  type: { type: String, enum: GENERATED_DOCUMENT_TYPES, required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 240 },
  content: { type: String, required: true, maxlength: 100000 },
  provider: { type: String, enum: ['template', 'openai', 'gemini', 'anthropic'], required: true },
  model: { type: String, trim: true, default: 'template-v1' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
schema.index({ userId: 1, type: 1, createdAt: -1 });
schema.index({ userId: 1, jobId: 1, createdAt: -1 });
export default mongoose.model('GeneratedDocument', schema);
