import Certification from '../models/Certification.js'; import { createResourceController } from './resource.controller.js';
const controller = createResourceController(Certification, { sort: '-issueDate' });
export const getCertifications = controller.list; export const createCertification = controller.create; export const updateCertification = controller.update; export const deleteCertification = controller.remove;
