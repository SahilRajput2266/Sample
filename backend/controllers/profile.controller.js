import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Certification from '../models/Certification.js';
import Language from '../models/Language.js';
import Resume from '../models/Resume.js';
import { calculateProfileCompletion, ensureProfile } from '../services/profile.service.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const editableFields=['profilePhoto','firstName','lastName','phone','alternatePhone','dateOfBirth','gender','currentCity','currentState','currentCountry','preferredLocations','currentCompany','currentDesignation','totalExperience','currentCTC','expectedCTC','noticePeriod','highestQualification','university','passingYear','linkedinUrl','githubUrl','portfolioUrl','website','summary'];
export const getProfile=async(req,res,next)=>{try{const userId=await resolveProfileUserId(req);let profile=String(userId)===String(req.user._id)?await ensureProfile(req.user):await Profile.findOne({userId});if(!profile)return res.status(404).json({message:'Profile not found'});await calculateProfileCompletion(userId);res.json(await Profile.findById(profile._id).lean());}catch(e){next(e);}};
export const updateProfile=async(req,res,next)=>{try{const userId=await resolveProfileUserId(req);const changes=Object.fromEntries(editableFields.filter(f=>req.body[f]!==undefined).map(f=>[f,req.body[f]]));const profile=await Profile.findOneAndUpdate({userId},{$set:changes,$setOnInsert:{userId}},{returnDocument:'after',upsert:true,runValidators:true,setDefaultsOnInsert:true});await calculateProfileCompletion(userId);res.json(await Profile.findById(profile._id).lean());}catch(e){next(e);}};
export const getProfileStats=async(req,res,next)=>{try{const userId=await resolveProfileUserId(req);if(String(userId)===String(req.user._id))await ensureProfile(req.user);const completion=await calculateProfileCompletion(userId);const [skills,experiences,educations,certifications,languages,resumes,latestResume]=await Promise.all([Skill.countDocuments({userId}),Experience.countDocuments({userId}),Education.countDocuments({userId}),Certification.countDocuments({userId}),Language.countDocuments({userId}),Resume.countDocuments({userId}),Resume.findOne({userId}).sort('-uploadedAt').lean()]);res.json({...completion,skills,experiences,educations,certifications,languages,resumes,latestResume});}catch(e){next(e);}};
