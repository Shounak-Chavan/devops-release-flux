import { Router } from 'express';
import { getFlagsForSdk } from './sdk.controller.js';
import { requireApiKey } from '../../shared/middlewares/requireApiKey.js';

const router = Router();

// Secure SDK routes with API Key authentication, NOT user login
router.use(requireApiKey);

/**
 * @route GET /api/v1/sdk/flags
 * @description Fetch all evaluated flags for the authenticated project environment
 */
router.get('/flags', getFlagsForSdk);

export default router;