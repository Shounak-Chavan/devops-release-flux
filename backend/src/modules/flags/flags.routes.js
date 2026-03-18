import { Router } from 'express';
import { addTargetingRule, createFlag, getFlagAuditLogs, getFlagById, getFlagsByProject, removeTargetingRule, rollbackFlag, scheduleFlagToggle, toggleFlag } from './flags.controller.js';
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

/**
 * @route POST /api/v1/flags/:flagId/rules
 * @description Add a targeting rule (e.g., city EQUALS Mumbai) to a flag
 */
router.post('/:flagId/rules', addTargetingRule);

/**
 * @route DELETE /api/v1/flags/:flagId/rules/:ruleId
 * @description Remove a targeting rule
 */
router.delete('/:flagId/rules/:ruleId', removeTargetingRule);

/**
 * @route POST /api/v1/flags/:flagId/rollback
 * @description Undo the last change made to a flag and record the rollback
 */
router.post('/:flagId/rollback', rollbackFlag);

/**
 * @route POST /api/v1/flags/:flagId/schedule
 * @description Schedule a flag to automatically turn ON or OFF at a future time
 */
router.post('/:flagId/schedule', scheduleFlagToggle);

/**
 * @route GET /api/v1/flags/:flagId
 * @description Get a single flag and its targeting rules
 */
router.get('/:flagId', getFlagById);

/**
 * @route GET /api/v1/flags/:flagId/logs
 * @description Get the audit history for a flag
 */
router.get('/:flagId/logs', getFlagAuditLogs);

export default router;