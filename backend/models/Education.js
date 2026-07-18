import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  degree: { type: String, required: true, trim: true, maxlength: 150 },
  specialization: { type: String, trim: true, maxlength: 150, default: '' },
  institute: { type: String, required: true, trim: true, maxlength: 200 },
  boardOrUniversity: { type: String, trim: true, maxlength: 200, default: '' },
  startYear: { type: Number, required: true, min: 1900, max: 2200 },
  endYear: { type: Number, required: true, min: 1900, max: 2200 },
  percentageOrCGPA: { type: String, trim: true, maxlength: 30, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, endYear: -1 });
export default mongoose.model('Education', schema);
