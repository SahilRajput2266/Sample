import Job from '../models/Job.js';
import JobActivity from '../models/JobActivity.js';
import JobPreference from '../models/JobPreference.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Resume from '../models/Resume.js';
import { fetchLinkedInJobs } from './job-sources/linkedin.service.js';
import { fetchIndeedJobs } from './job-sources/indeed.service.js';
import { fetchNaukriJobs } from './job-sources/naukri.service.js';
import { fetchInternshalaJobs } from './job-sources/internshala.service.js';
import { fetchWellfoundJobs } from './job-sources/wellfound.service.js';
import { fetchCompanyCareerJobs } from './job-sources/company-career.service.js';
import { normalizeJobs } from './job-normalizer.service.js';
import { calculateJobMatch } from './job-matching.service.js';

const sources = [fetchLinkedInJobs, fetchIndeedJobs, fetchNaukriJobs, fetchInternshalaJobs, fetchWellfoundJobs, fetchCompanyCareerJobs];

const experienceYears = (profile, experiences) => {
  if (profile?.totalExperience) return profile.totalExperience;
  const months = experiences.reduce((total, item) => {
    const end = item.currentlyWorking ? new Date() : item.endDate;
    if (!end || !item.startDate) return total;
    return total + Math.max(0, (new Date(end) - new Date(item.startDate)) / 2629800000);
  }, 0);
  return Math.round(months / 12 * 10) / 10;
};

export const fetchAndStoreJobs = async (userId) => {
  const [preferences, profile, skills, experiences, educations, resumes, sourceResults] = await Promise.all([
    JobPreference.findOne({ userId }).lean(), Profile.findOne({ userId }).lean(), Skill.find({ userId }).lean(),
    Experience.find({ userId }).lean(), Education.find({ userId }).lean(), Resume.find({ userId }).lean(),
    Promise.all(sources.map((source) => source())),
  ]);
  if (!preferences) { const error = new Error('Create job preferences before fetching jobs'); error.statusCode = 400; throw error; }

  const normalizedJobs = normalizeJobs(sourceResults.flat());
  const excluded = new Set(preferences.excludeCompanies.map((company) => company.toLowerCase()));
  const candidates = normalizedJobs.filter((job) => !excluded.has(job.company.toLowerCase()));
  const context = { preferences, profile, skillNames: skills.map((skill) => skill.skillName), totalExperience: experienceYears(profile, experiences), educations, resumes };
  const scored = candidates.map((job) => ({ ...job, ...calculateJobMatch(job, context) }));
  let newJobsSaved = 0;
  let duplicatesSkipped = 0;

  for (const job of scored) {
    const duplicate = job.sourceJobId
      ? { userId, source: job.source, sourceJobId: job.sourceJobId }
      : { userId, title: job.title, company: job.company, applyUrl: job.applyUrl };
    if (await Job.exists(duplicate)) { duplicatesSkipped += 1; continue; }
    try {
      const created = await Job.create({ ...job, userId, status: 'new' });
      await JobActivity.create({ userId, jobId: created._id, action: 'fetched', newStatus: 'new', metadata: { source: job.source } });
      newJobsSaved += 1;
    } catch (error) {
      if (error.code === 11000) duplicatesSkipped += 1;
      else throw error;
    }
  }

  const totalScore = scored.reduce((sum, job) => sum + job.matchScore, 0);
  return {
    totalFetched: scored.length, newJobsSaved, duplicatesSkipped,
    averageMatchScore: scored.length ? Math.round(totalScore / scored.length) : 0,
    highMatchJobs: scored.filter((job) => job.matchScore >= 70).length,
  };
};
