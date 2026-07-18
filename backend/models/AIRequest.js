import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  feature: { type: String, required: true, trim: true, index: true },
  provider: { type: String, enum: ['template', 'openai', 'gemini', 'anthropic'], required: true, index: true },
  model: { type: String, trim: true, default: '' },
  inputTokens: { type: Number, min: 0, default: 0 },
  outputTokens: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['success', 'failed'], required: true, index: true },
  errorMessage: { type: String, maxlength: 2000, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('AIRequest', schema);
