import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  generatedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'GeneratedDocument' },
  documentType: { type: String, enum: ['resume', 'cover_letter', 'portfolio', 'assignment', 'other'], required: true },
  fileUrl: { type: String, trim: true, default: '', validate: { validator: (value) => !value || /^(https?:\/\/|\/api\/)/i.test(value), message: 'fileUrl must be an HTTP(S) or API URL' } },
  title: { type: String, required: true, trim: true, maxlength: 200 },
}, { timestamps: true });
schema.index({ userId: 1, applicationId: 1, createdAt: -1 });
export default mongoose.model('ApplicationDocument', schema);
