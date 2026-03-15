import { Router } from 'express';
import { getProjectUsage } from './usage.controller.js';
import { requireAuth } from '../../shared/middlewares/requireAuth.js';

const router = Router();

// Secure routes so only the project owner can view their usage
router.use(requireAuth);

/**
 * @route GET /api/v1/usage/project/:projectId
 * @description Get the live SDK evaluation count for the current billing month
 */
router.get('/project/:projectId', getProjectUsage);

export default router;