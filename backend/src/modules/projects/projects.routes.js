import { Router } from 'express';
import { createProject, getProjects } from './projects.controller.js';
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

export default router;