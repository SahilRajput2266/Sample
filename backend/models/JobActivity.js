import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  action: { type: String, enum: ['fetched', 'viewed', 'saved', 'ignored', 'status_changed', 'apply_started'], required: true },
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
schema.index({ userId: 1, jobId: 1, createdAt: -1 });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('JobActivity', schema);
