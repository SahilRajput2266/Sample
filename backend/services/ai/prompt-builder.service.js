const schemas = {
  cover_letter: '{"content":"complete cover letter"}',
  resume_summary: '{"summary":"ATS-friendly professional summary"}',
  resume_optimization: '{"scoreBefore":0,"scoreAfter":0,"suggestions":[""],"missingKeywords":[""],"improvedSummary":"","improvedSkills":[""],"improvedExperienceBullets":[""]}',
  job_fit_analysis: '{"overallFitScore":0,"strengths":[""],"weaknesses":[""],"missingSkills":[""],"verdict":"","suggestions":[""]}',
  interview_questions: '{"hrQuestions":[{"question":"","suggestedAnswer":""}],"technicalQuestions":[{"question":"","suggestedAnswer":""}],"roleQuestions":[{"question":"","suggestedAnswer":""}],"companyPreparation":[""]}',
  follow_up_email: '{"subject":"","content":"complete email"}',
};

const compactContext = (context) => ({
  candidate: { name: context.user?.fullName, profile: context.profile, skills: context.skills?.map((item) => item.skillName), experience: context.experiences, education: context.educations },
  resume: context.resume ? { title: context.resume.title, originalFileName: context.resume.originalFileName } : null,
  job: context.job ? { title: context.job.title, company: context.job.company, location: context.job.location, description: context.job.description, skills: context.job.skills, requirements: context.job.requirements, responsibilities: context.job.responsibilities, matchScore: context.job.matchScore, missingSkills: context.job.missingSkills } : null,
  application: context.application ? { company: context.application.company, role: context.application.role, status: context.application.status, appliedAt: context.application.appliedAt, followUpDate: context.application.followUpDate, contactPerson: context.application.contactPerson } : null,
});

export const buildPrompt = (feature, context, options = {}) => ({
  systemPrompt: `You are a precise career-document assistant. Use only supplied facts. Never invent achievements, employers, skills, contacts, or metrics. Return valid JSON only, without markdown fences, matching this schema: ${schemas[feature]}. Scores must be integers from 0 to 100.`,
  userPrompt: JSON.stringify({ feature, preferences: options, context: compactContext(context) }).slice(0, 50000),
});

export const parseProviderJson = (text) => {
  const cleaned = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(cleaned); }
  catch { throw new Error('AI provider returned invalid structured output'); }
};
