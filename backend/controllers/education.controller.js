import Education from '../models/Education.js'; import { createResourceController } from './resource.controller.js';
const controller = createResourceController(Education, { sort: '-endYear' });
export const getEducations = controller.list; export const createEducation = controller.create; export const updateEducation = controller.update; export const deleteEducation = controller.remove;
