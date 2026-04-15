import { Router } from 'express';
import { fetchRuleset, streamRuleset } from './sdk.controller.js';
import { requireApiKey } from '../../shared/middlewares/requireApiKey.js';
import { sdkLimiter } from '../../shared/middlewares/rateLimiter.js';

const router = Router();

router.use(sdkLimiter);
// Secure SDK routes with API Key authentication
router.use(requireApiKey);

/**
 * @route GET /api/v1/sdk/ruleset
 * @description Fetches the complete hashed ruleset for local SDK evaluation.
 */
router.get('/ruleset', fetchRuleset);

/**
 * @route GET /api/v1/sdk/stream
 * @description Opens a persistent Server-Sent Events (SSE) connection for real-time updates.
 */
router.get('/stream', streamRuleset);

export default router;