import { Router } from 'express';
import { evaluateFlagsForContext } from './sdk.controller.js';
import { requireApiKey } from '../../shared/middlewares/requireApiKey.js';

const router = Router();

// Secure SDK routes with API Key authentication
router.use(requireApiKey);

/**
 * @route POST /api/v1/sdk/evaluate
 * @description Evaluate all flags for the authenticated project using the provided user context
 */
router.post('/evaluate', evaluateFlagsForContext);

export default router;