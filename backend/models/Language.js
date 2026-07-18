import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  language: { type: String, required: true, trim: true, maxlength: 80 },
  read: { type: Boolean, default: false }, write: { type: Boolean, default: false }, speak: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ userId: 1, language: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export default mongoose.model('Language', schema);
