import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  action: { type: String, enum: ['created', 'updated', 'status_changed', 'note_added', 'note_updated', 'note_deleted', 'interview_added', 'interview_updated', 'interview_deleted', 'document_added', 'document_deleted', 'automation_queued', 'automation_started', 'automation_action_required', 'automation_review_ready', 'automation_submitted', 'automation_cancelled'], required: true },
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
schema.index({ userId: 1, applicationId: 1, createdAt: -1 });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('ApplicationActivity', schema);
