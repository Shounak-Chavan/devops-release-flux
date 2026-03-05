// server/src/services/rulesEngine.js
import crypto from 'crypto';

/**
 * Deterministically assigns a user to a percentage bucket (1-100) based on their ID and the flag key.
 * This ensures that if a user is in the 10% rollout bucket, they stay there across multiple requests.
 * * @param {string} userId - The unique user identifier.
 * @param {string} flagKey - The unique flag key.
 * @returns {number} A number between 1 and 100.
 */
export const calculateRolloutBucket = (userId, flagKey) => {
  if (!userId) return 101; // Anonymous users fail the percentage rollout
  
  // Create a consistent hash from the flag key and user ID
  const hash = crypto.createHash('md5').update(`${flagKey}:${userId}`).digest('hex');
  
  // Convert the first 8 characters of the hex hash to an integer, modulo 100, add 1
  const bucket = (parseInt(hash.substring(0, 8), 16) % 100) + 1;
  return bucket;
};

/**
 * Evaluates a user context against an array of targeting rules.
 * Supports basic operators like equals, not_equals, and in.
 * * @param {Array<Object>} rules - Array of rule objects.
 * @param {Object} context - The user context object (e.g., { tier: 'premium', region: 'IN' }).
 * @returns {boolean} True if the context matches ANY of the rules (OR logic).
 */
export const evaluateTargetingRules = (rules, context) => {
  if (!rules || !Array.isArray(rules) || rules.length === 0) return false;
  if (!context) return false;

  // If ANY rule matches, the flag is enabled for this user
  return rules.some(rule => {
    const contextValue = context[rule.attribute];
    if (contextValue === undefined) return false;

    switch (rule.operator) {
      case 'equals': return contextValue === rule.value;
      case 'not_equals': return contextValue !== rule.value;
      case 'in': return Array.isArray(rule.value) && rule.value.includes(contextValue);
      default: return false;
    }
  });
};

/**
 * The core evaluation logic combining global state, targeting rules, and percentage rollouts.
 * * @param {Object} flagState - The state object from Postgres/Redis containing rules and rollout info.
 * @param {Object} context - The user context payload from the SDK.
 * @returns {boolean} The final resolved state for this specific user.
 */
export const resolveFlagState = (flagState, context) => {
  // 1. Master Kill Switch: If the flag state is totally disabled, it's OFF for everyone.
  if (!flagState.isEnabled) return false;

  // 2. Targeting Rules: Check if the user meets specific attribute criteria (e.g., tier === 'premium' [cite: 39]).
  if (flagState.rulesJson && Array.isArray(flagState.rulesJson) && flagState.rulesJson.length > 0) {
    const matchesRule = evaluateTargetingRules(flagState.rulesJson, context);
    if (matchesRule) return true; // Target met, bypass percentage rollout
  }

  // 3. Canary Release / Percentage Rollout [cite: 38]
  if (flagState.rolloutPercentage < 100) {
    if (flagState.rolloutPercentage === 0) return false;
    
    // Calculate deterministic bucket
    const bucket = calculateRolloutBucket(context?.userId, flagState.flagKey);
    return bucket <= flagState.rolloutPercentage;
  }

  // 4. Default: Enabled and 100% rollout
  return true;
};