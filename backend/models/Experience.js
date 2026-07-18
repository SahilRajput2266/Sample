import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, required: true, trim: true, maxlength: 180 },
  designation: { type: String, required: true, trim: true, maxlength: 150 },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Other'], default: 'Full-time' },
  startDate: { type: Date, required: true }, endDate: Date,
  currentlyWorking: { type: Boolean, default: false },
  location: { type: String, trim: true, maxlength: 150, default: '' },
  description: { type: String, trim: true, maxlength: 4000, default: '' },
  technologies: [{ type: String, trim: true, maxlength: 80 }],
}, { timestamps: true });
schema.index({ userId: 1, startDate: -1 });
export default mongoose.model('Experience', schema);
