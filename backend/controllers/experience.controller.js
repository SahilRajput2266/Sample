import Experience from '../models/Experience.js'; import { createResourceController } from './resource.controller.js';
const controller = createResourceController(Experience, { sort: '-startDate' });
export const getExperiences = controller.list; export const createExperience = controller.create; export const updateExperience = controller.update; export const deleteExperience = controller.remove;
