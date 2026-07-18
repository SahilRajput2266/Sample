const cleanArray = (values = []) => [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];

export const normalizeJob = (raw) => ({
  title: raw.position.trim(), company: raw.employer.trim(), companyLogo: raw.logo || '',
  location: raw.city || '', country: raw.country || '', remoteType: raw.mode || 'Onsite',
  salaryMin: Number(raw.salary?.[0]) || 0, salaryMax: Number(raw.salary?.[1]) || 0,
  currency: raw.currency || 'INR', experienceMin: Number(raw.experience?.[0]) || 0,
  experienceMax: Number(raw.experience?.[1]) || 0, skills: cleanArray(raw.skills),
  jobType: raw.type || 'Full-time', industry: raw.industry || '', source: raw.source,
  sourceJobId: raw.id ? String(raw.id) : undefined, applyUrl: raw.applyLink,
  description: raw.description, responsibilities: cleanArray(raw.responsibilities),
  requirements: cleanArray(raw.requirements), benefits: cleanArray(raw.benefits),
  postedAt: new Date(raw.posted), expiresAt: raw.expires ? new Date(raw.expires) : undefined,
});

export const normalizeJobs = (jobs) => jobs.map(normalizeJob);
