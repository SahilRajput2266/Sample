import Skill from '../models/Skill.js'; import { createResourceController } from './resource.controller.js';
const controller = createResourceController(Skill, { sort: 'skillName', duplicateLabel: 'Skill' });
export const getSkills = controller.list; export const createSkill = controller.create; export const updateSkill = controller.update; export const deleteSkill = controller.remove;
