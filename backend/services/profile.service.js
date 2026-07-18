import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Resume from '../models/Resume.js';

const has = (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';

export const calculateProfileCompletion = async (userId) => {
  const [profile, skills, experiences, educations, resumes] = await Promise.all([
    Profile.findOne({ userId }), Skill.countDocuments({ userId }), Experience.countDocuments({ userId }),
    Education.countDocuments({ userId }), Resume.countDocuments({ userId }),
  ]);
  if (!profile) return { completionPercentage: 0, isProfileCompleted: false };

  const personalFields = ['firstName', 'lastName', 'phone', 'currentCity', 'currentCountry', 'currentDesignation'];
  const personalScore = personalFields.filter((field) => has(profile[field])).length / personalFields.length * 20;
  const socialFields = ['linkedinUrl', 'githubUrl', 'portfolioUrl', 'website'];
  const socialScore = socialFields.some((field) => has(profile[field])) ? 10 : 0;
  const completionPercentage = Math.round(personalScore + (skills ? 20 : 0) + (experiences ? 20 : 0) + (educations ? 15 : 0) + (resumes ? 15 : 0) + socialScore);
  const isProfileCompleted = completionPercentage === 100;
  await Profile.updateOne({ userId }, { completionPercentage, isProfileCompleted });
  return { completionPercentage, isProfileCompleted };
};

export const ensureProfile = async (user) => {
  const names = user.fullName.trim().split(/\s+/);
  return Profile.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, firstName: names[0] || '', lastName: names.slice(1).join(' ') } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );
};
