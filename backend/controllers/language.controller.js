import Language from '../models/Language.js'; import { createResourceController } from './resource.controller.js';
const controller = createResourceController(Language, { sort: 'language', duplicateLabel: 'Language' });
export const getLanguages = controller.list; export const createLanguage = controller.create; export const updateLanguage = controller.update; export const deleteLanguage = controller.remove;
