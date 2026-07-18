import Application from '../models/Application.js';
import ApplicationNote from '../models/ApplicationNote.js';
import ApplicationInterview from '../models/ApplicationInterview.js';
import ApplicationDocument from '../models/ApplicationDocument.js';
import ApplicationActivity from '../models/ApplicationActivity.js';
import Resume from '../models/Resume.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

const parent = async (req) => {
  const userId = await resolveProfileUserId(req), application = await Application.findOne({ _id: req.params.id, userId });
  if (!application) { const error = new Error('Application not found'); error.statusCode = 404; throw error; }
  return { userId, application };
};
const activity = (userId, applicationId, action, metadata = {}) => ApplicationActivity.create({ userId, applicationId, action, metadata });

export const getNotes = async (req, res, next) => { try { const { userId, application } = await parent(req); res.json(await ApplicationNote.find({ userId, applicationId: application._id }).sort('-createdAt').lean()); } catch (error) { next(error); } };
export const addNote = async (req, res, next) => { try { const { userId, application } = await parent(req); const note = await ApplicationNote.create({ userId, applicationId: application._id, note: req.body.note }); await activity(userId, application._id, 'note_added', { noteId: note._id }); res.status(201).json(note); } catch (error) { next(error); } };
export const updateNote = async (req, res, next) => { try { const userId = await resolveProfileUserId(req); const note = await ApplicationNote.findOneAndUpdate({ _id: req.params.noteId, userId }, { $set: { note: req.body.note } }, { returnDocument: 'after', runValidators: true }); if (!note) return res.status(404).json({ message: 'Note not found' }); await activity(userId, note.applicationId, 'note_updated', { noteId: note._id }); res.json(note); } catch (error) { next(error); } };
export const deleteNote = async (req, res, next) => { try { const userId = await resolveProfileUserId(req); const note = await ApplicationNote.findOneAndDelete({ _id: req.params.noteId, userId }); if (!note) return res.status(404).json({ message: 'Note not found' }); await activity(userId, note.applicationId, 'note_deleted', { noteId: note._id }); res.json({ message: 'Note deleted' }); } catch (error) { next(error); } };

export const getInterviews = async (req, res, next) => { try { const { userId, application } = await parent(req); res.json(await ApplicationInterview.find({ userId, applicationId: application._id }).sort('interviewDate').lean()); } catch (error) { next(error); } };
export const addInterview = async (req, res, next) => { try { const { userId, application } = await parent(req); const interview = await ApplicationInterview.create({ ...req.body, userId, applicationId: application._id }); await activity(userId, application._id, 'interview_added', { interviewId: interview._id, roundTitle: interview.roundTitle }); res.status(201).json(interview); } catch (error) { next(error); } };
export const updateInterview = async (req, res, next) => { try { const userId = await resolveProfileUserId(req); const { userId: _user, applicationId: _app, _id: _id, ...changes } = req.body; const interview = await ApplicationInterview.findOneAndUpdate({ _id: req.params.interviewId, userId }, changes, { returnDocument: 'after', runValidators: true }); if (!interview) return res.status(404).json({ message: 'Interview not found' }); await activity(userId, interview.applicationId, 'interview_updated', { interviewId: interview._id }); res.json(interview); } catch (error) { next(error); } };
export const deleteInterview = async (req, res, next) => { try { const userId = await resolveProfileUserId(req); const interview = await ApplicationInterview.findOneAndDelete({ _id: req.params.interviewId, userId }); if (!interview) return res.status(404).json({ message: 'Interview not found' }); await activity(userId, interview.applicationId, 'interview_deleted', { interviewId: interview._id }); res.json({ message: 'Interview deleted' }); } catch (error) { next(error); } };

export const getDocuments = async (req, res, next) => { try { const { userId, application } = await parent(req); res.json(await ApplicationDocument.find({ userId, applicationId: application._id }).sort('-createdAt').populate('resumeId', 'title originalFileName fileUrl').lean()); } catch (error) { next(error); } };
export const addDocument = async (req, res, next) => {
  try {
    const { userId, application } = await parent(req);
    let resume;
    if (req.body.resumeId) { resume = await Resume.findOne({ _id: req.body.resumeId, userId }); if (!resume) return res.status(404).json({ message: 'Resume not found' }); }
    const document = await ApplicationDocument.create({ userId, applicationId: application._id, resumeId: resume?._id, documentType: req.body.documentType, fileUrl: req.body.fileUrl || resume?.fileUrl || '', title: req.body.title?.trim() || resume?.title });
    if (resume && !application.resumeId) { application.resumeId = resume._id; await application.save(); }
    await activity(userId, application._id, 'document_added', { documentId: document._id, documentType: document.documentType });
    res.status(201).json(document);
  } catch (error) { next(error); }
};
export const deleteDocument = async (req, res, next) => { try { const userId = await resolveProfileUserId(req); const document = await ApplicationDocument.findOneAndDelete({ _id: req.params.documentId, userId }); if (!document) return res.status(404).json({ message: 'Document not found' }); await activity(userId, document.applicationId, 'document_deleted', { documentId: document._id }); res.json({ message: 'Document removed' }); } catch (error) { next(error); } };

export const getActivities = async (req, res, next) => { try { const { userId, application } = await parent(req); res.json(await ApplicationActivity.find({ userId, applicationId: application._id }).sort('-createdAt').lean()); } catch (error) { next(error); } };
