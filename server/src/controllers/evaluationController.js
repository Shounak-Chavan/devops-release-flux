import { PrismaClient } from '@prisma/client';
import redisClient from '../services/redisClient.js';
import { resolveFlagState } from '../services/rulesEngine.js';

const prisma = new PrismaClient();

/**
 * @typedef {Object} EvaluationContext
 * @property {string} userId - The unique identifier of the end-user (from the client app).
 * @property {Record<string, any>} [attributes] - Optional user attributes for targeting rules.
 */

/**
 * Evaluates feature flags for a specific environment and user context.
 * * Flow:
 * 1. Extracts the API Key from the Authorization header.
 * 2. Checks Redis for a cached map of flags for this environment.
 * 3. On cache miss: Queries PostgreSQL for the Environment and its active FlagStates.
 * 4. Saves the result to Redis to ensure sub-20ms latency for subsequent requests[cite: 42].
 * 5. Returns the evaluated flag states to the SDK.
 * * @async
 * @function evaluateFlags
 * @param {import('express').Request} req - Express request object containing context in body and API key in headers.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with flag evaluations.
 */
export const evaluateFlags = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid API key format' });
    }
    const apiKey = authHeader.split(' ')[1];
    const context = req.body; 

    const cacheKey = `env_config:${apiKey}`; // Changed key name for clarity

    let environmentConfig;

    // 1. Fetch Configuration from Cache
    const cachedConfig = await redisClient.get(cacheKey);
    
    if (cachedConfig) {
      environmentConfig = JSON.parse(cachedConfig);
    } else {
      // 2. Cache Miss: Fetch Configuration from DB
      const environment = await prisma.environment.findUnique({
        where: { apiKey },
        include: {
          flagStates: {
            include: { flag: true } 
          }
        }
      });

      if (!environment) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Format the DB result into a fast, cached map of rules
      environmentConfig = {};
      for (const state of environment.flagStates) {
        environmentConfig[state.flag.key] = {
          flagKey: state.flag.key,
          isEnabled: state.isEnabled,
          rulesJson: state.rulesJson,
          rolloutPercentage: state.rolloutPercentage
        };
      }

      // Populate Cache with the raw configuration
      await redisClient.setEx(cacheKey, 60, JSON.stringify(environmentConfig));
    }

    // 3. Execute the Rules Engine dynamically for this specific request
    const evaluatedFlags = {};
    for (const [key, config] of Object.entries(environmentConfig)) {
      evaluatedFlags[key] = resolveFlagState(config, context);
    }

    return res.status(200).json({ 
      source: cachedConfig ? 'cache' : 'database', 
      flags: evaluatedFlags 
    });

  } catch (error) {
    console.error('Evaluation Error:', error);
    return res.status(500).json({ error: 'Internal server error during evaluation' });
  }
};
