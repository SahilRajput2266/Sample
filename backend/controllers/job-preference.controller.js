import JobPreference from '../models/JobPreference.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const fields = ['targetRoles','skills','preferredLocations','remoteOnly','hybridAllowed','onsiteAllowed','minSalary','maxSalary','currency','experienceLevel','minExperience','maxExperience','jobType','companySize','preferredIndustries','excludeCompanies','keywords','noticePeriod','willingToRelocate'];

export const getJobPreferences = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    res.json(await JobPreference.findOne({ userId }).lean() || null);
  } catch (error) { next(error); }
};

export const updateJobPreferences = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const changes = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const preferences = await JobPreference.findOneAndUpdate(
      { userId }, { $set: changes, $setOnInsert: { userId } },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json(preferences);
  } catch (error) { next(error); }
};

export const deleteJobPreferences = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const deleted = await JobPreference.findOneAndDelete({ userId });
    if (!deleted) return res.status(404).json({ message: 'Job preferences not found' });
    res.json({ message: 'Job preferences deleted' });
  } catch (error) { next(error); }
};
