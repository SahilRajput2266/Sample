import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  issuer: { type: String, required: true, trim: true, maxlength: 180 },
  issueDate: { type: Date, required: true }, expiryDate: Date,
  credentialId: { type: String, trim: true, maxlength: 180, default: '' },
  credentialUrl: { type: String, trim: true, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, issueDate: -1 });
export default mongoose.model('Certification', schema);
