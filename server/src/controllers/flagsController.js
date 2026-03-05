import { PrismaClient } from '@prisma/client';
import redisClient from '../services/redisClient.js';

const prisma = new PrismaClient();

/**
 * Creates a new feature flag and initializes its state (disabled by default) 
 * across all environments within the specified project.
 * * @async
 * @function createFlag
 * @param {import('express').Request} req - Express request object containing flag details.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const createFlag = async (req, res) => {
  const { key, name, description, projectId } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized: User context missing' });

  try {
    // 1. Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { environments: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    // 2. Create the flag, its initial states, and audit log in a transaction
    const flag = await prisma.$transaction(async (tx) => {
      const newFlag = await tx.flag.create({
        data: { key, name, description, projectId }
      });

      // Create a default 'OFF' state for every environment in this project
      const statePromises = project.environments.map(env => 
        tx.flagState.create({
          data: {
            flagId: newFlag.id,
            environmentId: env.id,
            isEnabled: false
          }
        })
      );
      await Promise.all(statePromises);

      // Create the initial Audit Log entry
      await tx.auditLog.create({
        data: {
          action: 'FLAG_CREATED',
          flagId: newFlag.id,
          userId: userId,
          newState: { key, name, description }
        }
      });

      return newFlag;
    });

    res.status(201).json({ message: 'Flag created successfully', flag });
  } catch (error) {
    console.error('Create Flag Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Flag key must be unique within this project' });
    }
    res.status(500).json({ error: 'Failed to create flag' });
  }
};

/**
 * Toggles a flag's state (ON/OFF) for a specific environment, 
 * invalidates the Redis cache, and writes an audit log.
 * * @async
 * @function toggleFlagState
 * @param {import('express').Request} req - Express request object containing flagId, environmentId, and isEnabled state.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const toggleFlagState = async (req, res) => {
  const { flagId, environmentId } = req.params;
  const { isEnabled } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized: User context missing' });

  try {
    // 1. Find current state and environment's API key (needed for cache invalidation)
    const currentState = await prisma.flagState.findUnique({
      where: { flagId_environmentId: { flagId, environmentId } },
      include: { environment: true }
    });

    if (!currentState) {
      return res.status(404).json({ error: 'Flag state not found for this environment' });
    }

    // 2. Update state and write audit log in a transaction
    const updatedState = await prisma.$transaction(async (tx) => {
      const state = await tx.flagState.update({
        where: { id: currentState.id },
        data: { isEnabled }
      });

      await tx.auditLog.create({
        data: {
          action: isEnabled ? 'TOGGLED_ON' : 'TOGGLED_OFF',
          flagId: flagId,
          userId: userId,
          previousState: { isEnabled: currentState.isEnabled },
          newState: { isEnabled: state.isEnabled }
        }
      });

      return state;
    });

    // 3. CACHE INVALIDATION
    // Ensure that subsequent SDK evaluations reflect the updated state immediately[cite: 66].
    const cacheKey = `env_flags:${currentState.environment.apiKey}`;
    await redisClient.del(cacheKey);

    res.status(200).json({ message: 'Flag state updated', state: updatedState });
  } catch (error) {
    console.error('Toggle Flag Error:', error);
    res.status(500).json({ error: 'Failed to update flag state' });
  }
};


/**
 * Retrieves all flags and their states for a given project.
 * Validates that the user owns the project before returning data.
 * * @async
 * @function getFlags
 * @param {import('express').Request} req - Express request object containing projectId in query.
 * @param {import('express').Response} res - Express response object.
 */
export const getFlags = async (req, res) => {
  const { projectId } = req.query;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Verify tenant access
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    // 2. Fetch flags and their nested states
    const flags = await prisma.flag.findMany({
      where: { projectId },
      include: {
        states: {
          include: {
            environment: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ flags });
  } catch (error) {
    console.error('Get Flags Error:', error);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
};


/**
 * Updates the targeting rules and rollout percentage for a specific flag environment.
 */
export const updateFlagRules = async (req, res) => {
  const { flagId, environmentId } = req.params;
  const { rulesJson, rolloutPercentage } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const currentState = await prisma.flagState.findUnique({
      where: { flagId_environmentId: { flagId, environmentId } },
      include: { environment: true }
    });

    if (!currentState) {
      return res.status(404).json({ error: 'Flag state not found' });
    }

    const updatedState = await prisma.$transaction(async (tx) => {
      const state = await tx.flagState.update({
        where: { id: currentState.id },
        data: { rulesJson, rolloutPercentage }
      });

      // Maintain our comprehensive audit trail [cite: 40]
      await tx.auditLog.create({
        data: {
          action: 'RULES_UPDATED',
          flagId: flagId,
          userId: userId,
          previousState: { rulesJson: currentState.rulesJson, rolloutPercentage: currentState.rolloutPercentage },
          newState: { rulesJson: state.rulesJson, rolloutPercentage: state.rolloutPercentage }
        }
      });

      return state;
    });

    // Invalidate the cache configuration so the next SDK request fetches the new rules
    const cacheKey = `env_config:${currentState.environment.apiKey}`;
    await redisClient.del(cacheKey);

    res.status(200).json({ message: 'Rules updated successfully', state: updatedState });
  } catch (error) {
    console.error('Update Rules Error:', error);
    res.status(500).json({ error: 'Failed to update rules' });
  }
};