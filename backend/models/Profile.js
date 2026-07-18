import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  profilePhoto: { type: String, trim: true, default: '' },
  firstName: { type: String, trim: true, maxlength: 80, default: '' },
  lastName: { type: String, trim: true, maxlength: 80, default: '' },
  phone: { type: String, trim: true, maxlength: 25, default: '' },
  alternatePhone: { type: String, trim: true, maxlength: 25, default: '' },
  dateOfBirth: Date,
  gender: { type: String, trim: true, maxlength: 40, default: '' },
  currentCity: { type: String, trim: true, maxlength: 100, default: '' },
  currentState: { type: String, trim: true, maxlength: 100, default: '' },
  currentCountry: { type: String, trim: true, maxlength: 100, default: '' },
  preferredLocations: [{ type: String, trim: true, maxlength: 100 }],
  currentCompany: { type: String, trim: true, maxlength: 150, default: '' },
  currentDesignation: { type: String, trim: true, maxlength: 150, default: '' },
  totalExperience: { type: Number, min: 0, max: 80, default: 0 },
  currentCTC: { type: Number, min: 0, default: 0 },
  expectedCTC: { type: Number, min: 0, default: 0 },
  noticePeriod: { type: String, trim: true, maxlength: 80, default: '' },
  highestQualification: { type: String, trim: true, maxlength: 150, default: '' },
  university: { type: String, trim: true, maxlength: 200, default: '' },
  passingYear: { type: Number, min: 1900, max: 2200 },
  linkedinUrl: { type: String, trim: true, default: '' },
  githubUrl: { type: String, trim: true, default: '' },
  portfolioUrl: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
  summary: { type: String, trim: true, maxlength: 3000, default: '' },
  isProfileCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
