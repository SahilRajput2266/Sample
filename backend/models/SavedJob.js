import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });
schema.index({ userId: 1, jobId: 1 }, { unique: true });
export default mongoose.model('SavedJob', schema);
