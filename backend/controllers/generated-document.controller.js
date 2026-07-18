import GeneratedDocument from '../models/GeneratedDocument.js';
import Application from '../models/Application.js';
import ApplicationDocument from '../models/ApplicationDocument.js';
import ApplicationActivity from '../models/ApplicationActivity.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const owned = async (req) => ({ _id: req.params.id, userId: await resolveProfileUserId(req) });
export const listGeneratedDocuments = async (req, res, next) => {
  try {
    const userId = await resolveProfileUserId(req), filter = { userId };
    for (const field of ['type', 'jobId', 'applicationId']) if (req.query[field]) filter[field] = req.query[field];
    const page = Math.max(1, Number(req.query.page || 1)), limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const [documents, total] = await Promise.all([GeneratedDocument.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).select('-metadata.structured').lean(), GeneratedDocument.countDocuments(filter)]);
    res.json({ documents, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
};
export const getGeneratedDocument = async (req, res, next) => { try { const document = await GeneratedDocument.findOne(await owned(req)).lean(); if (!document) return res.status(404).json({ message: 'Generated document not found' }); res.json(document); } catch (error) { next(error); } };
export const updateGeneratedDocument = async (req, res, next) => { try { const changes = {}; for (const field of ['title','content']) if (req.body[field] !== undefined) changes[field] = req.body[field]; const document = await GeneratedDocument.findOneAndUpdate(await owned(req), { $set: changes }, { returnDocument: 'after', runValidators: true }); if (!document) return res.status(404).json({ message: 'Generated document not found' }); res.json(document); } catch (error) { next(error); } };
export const deleteGeneratedDocument = async (req, res, next) => { try { const document = await GeneratedDocument.findOneAndDelete(await owned(req)); if (!document) return res.status(404).json({ message: 'Generated document not found' }); await ApplicationDocument.deleteMany({ userId: document.userId, generatedDocumentId: document._id }); res.json({ message: 'Generated document deleted' }); } catch (error) { next(error); } };
export const attachGeneratedDocument = async (req, res, next) => {
  try {
    const document = await GeneratedDocument.findOne(await owned(req));
    if (!document) return res.status(404).json({ message: 'Generated document not found' });
    const applicationId = req.body?.applicationId || document.applicationId;
    const application = await Application.findOne({ _id: applicationId, userId: document.userId });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const documentType = document.type === 'cover_letter' ? 'cover_letter' : 'other';
    const attachment = await ApplicationDocument.findOneAndUpdate(
      { userId: document.userId, applicationId: application._id, generatedDocumentId: document._id },
      { $set: { documentType, title: document.title, fileUrl: `/api/generated-documents/${document._id}` }, $setOnInsert: { userId: document.userId, applicationId: application._id, generatedDocumentId: document._id } },
      { returnDocument: 'after', upsert: true, runValidators: true },
    );
    document.applicationId = application._id; await document.save();
    await ApplicationActivity.create({ userId: document.userId, applicationId: application._id, action: 'document_added', metadata: { generatedDocumentId: document._id, type: document.type } });
    res.status(201).json(attachment);
  } catch (error) { next(error); }
};
