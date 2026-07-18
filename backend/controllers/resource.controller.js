import { calculateProfileCompletion } from '../services/profile.service.js';
import { resolveProfileUserId } from '../utils/profileAccess.js';

export const createResourceController = (Model, { sort = '-createdAt', duplicateLabel = '' } = {}) => ({
  list: async (req, res, next) => { try { const userId = await resolveProfileUserId(req); res.json(await Model.find({ userId }).sort(sort).lean()); } catch (e) { next(e); } },
  create: async (req, res, next) => {
    try {
      const userId = await resolveProfileUserId(req);
      const item = await Model.create({ ...req.body, userId });
      await calculateProfileCompletion(item.userId);
      res.status(201).json(item);
    } catch (e) {
      if (e.code === 11000) { res.status(409); return next(new Error(`${duplicateLabel || 'Item'} already exists`)); }
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const userId = await resolveProfileUserId(req);
      const { userId: _ignored, _id: _ignoredId, ...changes } = req.body;
      const item = await Model.findOneAndUpdate({ _id: req.params.id, userId }, changes, { returnDocument: 'after', runValidators: true });
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      await calculateProfileCompletion(item.userId);
      res.json(item);
    } catch (e) {
      if (e.code === 11000) { res.status(409); return next(new Error(`${duplicateLabel || 'Item'} already exists`)); }
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const userId = await resolveProfileUserId(req);
      const item = await Model.findOneAndDelete({ _id: req.params.id, userId });
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      await calculateProfileCompletion(item.userId);
      res.json({ message: 'Deleted successfully' });
    } catch (e) { next(e); }
  },
});
