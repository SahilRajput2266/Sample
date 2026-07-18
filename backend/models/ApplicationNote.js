import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  note: { type: String, required: true, trim: true, maxlength: 5000 },
}, { timestamps: true });
schema.index({ userId: 1, applicationId: 1, createdAt: -1 });
export default mongoose.model('ApplicationNote', schema);
