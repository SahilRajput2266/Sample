import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));
export const resumeDirectory = path.resolve(serviceDirectory, '..', 'uploads', 'resumes');
await fs.mkdir(resumeDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDirectory),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

export const removeResumeFile = async (storedFileName) => {
  const filePath = path.join(resumeDirectory, path.basename(storedFileName));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.unlink(filePath);
      return;
    } catch (error) {
      if (error.code === 'ENOENT') return;
      if (!['EBUSY', 'EPERM'].includes(error.code) || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }
};

const storage = {
  _handleFile: diskStorage._handleFile.bind(diskStorage),
  _removeFile: (_req, file, cb) => removeResumeFile(file.filename).then(() => cb(null)).catch(cb),
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const valid = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error('Only PDF, DOC, and DOCX files are allowed'), valid);
  },
});

export const resumeFilePath = (storedFileName) => path.join(resumeDirectory, path.basename(storedFileName));
