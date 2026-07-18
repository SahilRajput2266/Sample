import fs from 'node:fs/promises';
import Resume from '../models/Resume.js';
import { calculateProfileCompletion } from '../services/profile.service.js';
import { removeResumeFile, resumeFilePath } from '../services/resume.service.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const ownedResume = async (req) => ({ _id: req.params.id, userId: await resolveProfileUserId(req) });

export const getResumes = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    res.json(await Resume.find({ userId }).sort({ isDefault: -1, uploadedAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
};

export const createResume = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req);
    const resume = new Resume({
      userId,
      title: req.body.title?.trim() || req.file.originalname.replace(/\.(pdf|docx?)$/i, ''),
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: 'pending',
      isDefault: false,
    });
    resume.fileUrl = `/api/profile/resume/download/${resume._id}`;
    await resume.save();

    if (!(await Resume.exists({ userId, isDefault: true }))) {
      try {
        await Resume.updateOne({ _id: resume._id }, { $set: { isDefault: true } });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }

    await calculateProfileCompletion(userId);
    res.status(201).json(await Resume.findById(resume._id));
  } catch (error) {
    if (req.file) await removeResumeFile(req.file.filename).catch(() => {});
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete(await ownedResume(req));
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    try {
      await removeResumeFile(resume.storedFileName);
    } catch (error) {
      console.error(`Failed to remove resume file ${resume.storedFileName}:`, error.message);
    }

    if (resume.isDefault) {
      await Resume.findOneAndUpdate(
        { userId: resume.userId },
        { $set: { isDefault: true } },
        { sort: { uploadedAt: -1 } },
      );
    }
    await calculateProfileCompletion(resume.userId);
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};

export const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne(await ownedResume(req));
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (resume.isDefault) return res.json(resume);

    const previousDefault = await Resume.findOne({ userId: resume.userId, isDefault: true });
    if (previousDefault) await Resume.updateOne({ _id: previousDefault._id }, { $set: { isDefault: false } });
    try {
      return res.json(await Resume.findByIdAndUpdate(resume._id, { $set: { isDefault: true } }, { returnDocument: 'after', runValidators: true }));
    } catch (error) {
      if (previousDefault) await Resume.updateOne({ _id: previousDefault._id }, { $set: { isDefault: true } }).catch(() => {});
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne(await ownedResume(req));
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    const filePath = resumeFilePath(resume.storedFileName);
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'Resume file is missing from storage' });
    }
    res.download(filePath, resume.originalFileName);
  } catch (error) {
    next(error);
  }
};
