import { Router } from 'express';
import {  getProjectUsageSummary, trackUsage } from './usage.controller.js';
import { requireApiKey } from '../../shared/middlewares/requireApiKey.js';
import { requireAuth } from '../../shared/middlewares/requireAuth.js';

const router = Router();

/**
 * @route   POST /api/v1/usage/track
 * @desc    Receives batched evaluation counts from the Client SDK.
 * @access  Public (Requires Client or Server API Key)
 */
router.post('/track', requireApiKey, trackUsage);


// Endpoint for the Next.js Dashboard to fetch analytics
router.get('/project/:projectId', requireAuth, getProjectUsageSummary);


export default router;