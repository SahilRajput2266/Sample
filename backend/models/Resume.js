import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  originalFileName: { type: String, required: true }, storedFileName: { type: String, required: true, unique: true },
  fileUrl: { type: String, required: true }, fileSize: { type: Number, required: true, min: 1 },
  mimeType: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ userId: 1, uploadedAt: -1 });
schema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });
export default mongoose.model('Resume', schema);
