import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skillName: { type: String, required: true, trim: true, maxlength: 100 },
  yearsOfExperience: { type: Number, min: 0, max: 80, default: 0 },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  category: { type: String, trim: true, maxlength: 100, default: 'Other' },
}, { timestamps: true });
schema.index({ userId: 1, skillName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export default mongoose.model('Skill', schema);
