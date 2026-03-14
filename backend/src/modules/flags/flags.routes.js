import { Router } from 'express';
import { createFlag, getFlagsByProject, toggleFlag } from './flags.controller.js';
import { requireAuth } from '../../shared/middlewares/requireAuth.js';

const router = Router();

// Secure all flag routes
router.use(requireAuth);

/**
 * @route POST /api/v1/flags
 * @description Create a new feature flag
 */
router.post('/', createFlag);

/**
 * @route GET /api/v1/flags/project/:projectId
 * @description Get all flags for a specific project
 */
router.get('/project/:projectId', getFlagsByProject);

/**
 * @route PATCH /api/v1/flags/:flagId/toggle
 * @description Toggle a flag ON/OFF and record to audit log
 */
router.patch('/:flagId/toggle', toggleFlag);

export default router;