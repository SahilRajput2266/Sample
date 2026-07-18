import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  scoreBefore: { type: Number, min: 0, max: 100, required: true },
  scoreAfter: { type: Number, min: 0, max: 100, required: true },
  suggestions: [{ type: String, trim: true, maxlength: 1000 }],
  missingKeywords: [{ type: String, trim: true, maxlength: 100 }],
  improvedSummary: { type: String, maxlength: 5000, default: '' },
  improvedSkills: [{ type: String, trim: true, maxlength: 100 }],
  improvedExperienceBullets: [{ type: String, trim: true, maxlength: 1000 }],
}, { timestamps: true });
schema.index({ userId: 1, resumeId: 1, jobId: 1, createdAt: -1 });
export default mongoose.model('ResumeOptimization', schema);
