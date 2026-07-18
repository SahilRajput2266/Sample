import User from '../../models/User.js';
import Profile from '../../models/Profile.js';
import Skill from '../../models/Skill.js';
import Experience from '../../models/Experience.js';
import Education from '../../models/Education.js';
import Resume from '../../models/Resume.js';
import Job from '../../models/Job.js';
import Application from '../../models/Application.js';
import GeneratedDocument from '../../models/GeneratedDocument.js';
import AIRequest from '../../models/AIRequest.js';
import ResumeOptimization from '../../models/ResumeOptimization.js';
import { resolveAIProvider } from './ai-provider.service.js';
import { buildPrompt, parseProviderJson } from './prompt-builder.service.js';
import { generateWithTemplate } from './template-ai.service.js';

const titles = { cover_letter: 'Cover Letter', resume_summary: 'Resume Summary', resume_optimization: 'Resume Optimization', job_fit_analysis: 'Job Fit Analysis', interview_questions: 'Interview Preparation', follow_up_email: 'Follow-up Email' };
const formatItems = (items) => (items || []).map((item) => typeof item === 'string' ? `- ${item}` : `- ${item.question}\n  Suggested answer: ${item.suggestedAnswer}`).join('\n');
const formatDocument = (feature, data) => {
  if (feature === 'cover_letter') return data.content;
  if (feature === 'resume_summary') return data.summary;
  if (feature === 'follow_up_email') return `Subject: ${data.subject}\n\n${data.content}`;
  if (feature === 'resume_optimization') return `ATS Score: ${data.scoreBefore} → ${data.scoreAfter}\n\nImproved Summary\n${data.improvedSummary}\n\nSuggestions\n${formatItems(data.suggestions)}\n\nMissing Keywords\n${formatItems(data.missingKeywords)}\n\nImproved Skills\n${formatItems(data.improvedSkills)}\n\nImproved Experience Bullets\n${formatItems(data.improvedExperienceBullets)}`;
  if (feature === 'job_fit_analysis') return `Overall Fit Score: ${data.overallFitScore}%\n\n${data.verdict}\n\nStrengths\n${formatItems(data.strengths)}\n\nWeaknesses\n${formatItems(data.weaknesses)}\n\nMissing Skills\n${formatItems(data.missingSkills)}\n\nSuggestions\n${formatItems(data.suggestions)}`;
  return `HR Questions\n${formatItems(data.hrQuestions)}\n\nTechnical Questions\n${formatItems(data.technicalQuestions)}\n\nRole-specific Questions\n${formatItems(data.roleQuestions)}\n\nCompany Preparation\n${formatItems(data.companyPreparation)}`;
};

const loadContext = async (userId, input) => {
  const [user, profile, skills, experiences, educations, requestedResume, requestedJob, requestedApplication] = await Promise.all([
    User.findById(userId).lean(), Profile.findOne({ userId }).lean(), Skill.find({ userId }).lean(), Experience.find({ userId }).sort('-startDate').lean(), Education.find({ userId }).sort('-endYear').lean(),
    input.resumeId ? Resume.findOne({ _id: input.resumeId, userId }).lean() : null,
    input.jobId ? Job.findOne({ _id: input.jobId, userId }).lean() : null,
    input.applicationId ? Application.findOne({ _id: input.applicationId, userId }).lean() : null,
  ]);
  if (input.resumeId && !requestedResume) throw Object.assign(new Error('Resume not found'), { statusCode: 404 });
  if (input.jobId && !requestedJob) throw Object.assign(new Error('Job not found'), { statusCode: 404 });
  if (input.applicationId && !requestedApplication) throw Object.assign(new Error('Application not found'), { statusCode: 404 });
  const job = requestedJob || (requestedApplication?.jobId ? await Job.findOne({ _id: requestedApplication.jobId, userId }).lean() : null);
  const application = requestedApplication;
  const syntheticJob = !job && application ? { title: application.role, company: application.company, location: application.location, skills: [], requirements: [], responsibilities: [], matchScore: 0, missingSkills: [] } : null;
  return { user, profile, skills, experiences, educations, resume: requestedResume, job: job || syntheticJob, application };
};

export const generateDocument = async (userId, feature, input) => {
  const provider = resolveAIProvider();
  try {
    const context = await loadContext(userId, input);
    let result;
    if (provider.provider === 'template') result = generateWithTemplate(feature, context, input);
    else {
      const prompts = buildPrompt(feature, context, input), generated = await provider.generate({ ...prompts, model: provider.model });
      result = { structured: parseProviderJson(generated.text), inputTokens: generated.inputTokens, outputTokens: generated.outputTokens };
    }
    const content = formatDocument(feature, result.structured);
    const target = context.job ? ` for ${context.job.title} at ${context.job.company}` : context.application ? ` for ${context.application.role} at ${context.application.company}` : '';
    const document = await GeneratedDocument.create({ userId, jobId: input.jobId || context.job?._id, applicationId: input.applicationId, type: feature, title: `${titles[feature]}${target}`, content, provider: provider.provider, model: provider.model, metadata: { structured: result.structured, options: input } });
    if (feature === 'resume_optimization') await ResumeOptimization.create({ userId, resumeId: input.resumeId, jobId: input.jobId, ...result.structured });
    await AIRequest.create({ userId, feature, provider: provider.provider, model: provider.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens, status: 'success' });
    return { document, result: result.structured, provider: provider.provider, model: provider.model };
  } catch (error) {
    await AIRequest.create({ userId, feature, provider: provider.provider, model: provider.model, status: 'failed', errorMessage: error.message }).catch(() => {});
    throw error;
  }
};
