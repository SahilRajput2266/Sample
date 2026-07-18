import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  targetRoles: [{ type: String, trim: true, maxlength: 120 }],
  skills: [{ type: String, trim: true, maxlength: 80 }],
  preferredLocations: [{ type: String, trim: true, maxlength: 120 }],
  remoteOnly: { type: Boolean, default: false },
  hybridAllowed: { type: Boolean, default: true },
  onsiteAllowed: { type: Boolean, default: true },
  minSalary: { type: Number, min: 0, default: 0 },
  maxSalary: { type: Number, min: 0, default: 0 },
  currency: { type: String, trim: true, uppercase: true, maxlength: 3, default: 'INR' },
  experienceLevel: { type: String, enum: ['', 'Entry', 'Mid', 'Senior', 'Lead'], default: '' },
  minExperience: { type: Number, min: 0, max: 80, default: 0 },
  maxExperience: { type: Number, min: 0, max: 80, default: 0 },
  jobType: { type: String, enum: ['', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], default: '' },
  companySize: { type: String, enum: ['', 'Startup', 'Small', 'Medium', 'Large', 'Enterprise'], default: '' },
  preferredIndustries: [{ type: String, trim: true, maxlength: 120 }],
  excludeCompanies: [{ type: String, trim: true, maxlength: 180 }],
  keywords: [{ type: String, trim: true, maxlength: 100 }],
  noticePeriod: { type: String, trim: true, maxlength: 80, default: '' },
  willingToRelocate: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('JobPreference', schema);
