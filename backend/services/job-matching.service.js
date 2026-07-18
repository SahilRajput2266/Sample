const normalize = (value) => String(value || '').trim().toLowerCase();
const includesEither = (left, right) => normalize(left).includes(normalize(right)) || normalize(right).includes(normalize(left));

export const calculateJobMatch = (job, context) => {
  const { preferences, skillNames, totalExperience } = context;
  const reasons = [];
  let score = 0;

  const role = preferences.targetRoles.find((target) => includesEither(job.title, target));
  if (role) { score += 25; reasons.push(`Role matches your target role: ${role}`); }

  const candidateSkills = new Set([...preferences.skills, ...skillNames].map(normalize));
  const matchedSkills = job.skills.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingSkills = job.skills.filter((skill) => !candidateSkills.has(normalize(skill)));
  if (job.skills.length) {
    score += matchedSkills.length / job.skills.length * 30;
    if (matchedSkills.length) reasons.push(`Matched ${matchedSkills.length} out of ${job.skills.length} required skills`);
  }

  const locations = preferences.preferredLocations.map(normalize);
  const locationMatched = !locations.length || locations.some((location) => includesEither(job.location, location)) || (job.remoteType === 'Remote' && (preferences.remoteOnly || locations.includes('remote')));
  if (locationMatched) { score += 15; reasons.push(`Location matches your preference: ${job.remoteType === 'Remote' ? 'Remote' : job.location}`); }

  const experienceMatched = totalExperience >= job.experienceMin && (!job.experienceMax || totalExperience <= job.experienceMax);
  if (experienceMatched) { score += 15; reasons.push('Experience range matches your profile'); }

  const hasSalaryPreference = preferences.minSalary > 0 || preferences.maxSalary > 0;
  const salaryMatched = !hasSalaryPreference || ((!preferences.minSalary || job.salaryMax >= preferences.minSalary) && (!preferences.maxSalary || job.salaryMin <= preferences.maxSalary));
  if (salaryMatched) { score += 10; reasons.push(hasSalaryPreference ? 'Salary range overlaps your preference' : 'No salary constraint conflicts'); }

  const workModeMatched = job.remoteType === 'Remote' || (!preferences.remoteOnly && job.remoteType === 'Hybrid' && preferences.hybridAllowed) || (!preferences.remoteOnly && job.remoteType === 'Onsite' && preferences.onsiteAllowed);
  if (workModeMatched) { score += 5; reasons.push(`Work mode matches: ${job.remoteType}`); }

  return { matchScore: Math.max(0, Math.min(100, Math.round(score))), matchReasons: reasons, missingSkills };
};
