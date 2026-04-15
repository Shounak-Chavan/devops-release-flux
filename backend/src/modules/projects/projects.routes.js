import { Router } from 'express';
import { createProject, deleteProject, getProjects, rotateApiKey } from './projects.controller.js';
import { requireAuth } from '../../shared/middlewares/requireAuth.js';

const router = Router();

// Apply the requireAuth middleware to all routes in this module
router.use(requireAuth);

/**
 * @route POST /api/v1/projects
 * @description Create a new project and generate an API key
 */
router.post('/', createProject);

/**
 * @route GET /api/v1/projects
 * @description Get all projects for the logged-in user
 */
router.get('/', getProjects);

/**
 * @route DELETE /api/v1/projects/:projectId
 * @description Permanently delete a project and all associated data
 */
router.delete('/:projectId', deleteProject);

/**
 * @route PATCH /api/v1/projects/:projectId/rotate-key
 * @description Generate a new API key for the project, invalidating the old one
 */
router.patch('/:projectId/rotate-key', rotateApiKey);

export default router;
