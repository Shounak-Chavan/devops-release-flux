import { calculateRolloutBucket } from '../../shared/utils/hash.js';

/**
 * Evaluates a user's context against a set of targeting rules for a specific flag.
 * * @function evaluateRules
 * @param {Object} context - The user context (e.g., { userId: '123', city: 'Mumbai', plan: 'Premium' }).
 * @param {Array} rules - An array of rule objects fetched from the database for this flag.
 * @param {string} flagId - The ID of the flag being evaluated.
 * @returns {boolean} True if the user passes the rules and rollout criteria, false otherwise.
 */
export const evaluateRules = (context, rules, flagId) => {
    // If there are no rules, the flag relies purely on its base status
    if (!rules || rules.length === 0) {
        return true; 
    }

    // Check attribute matching
    const passesAttributes = rules.every(rule => {
        if (!rule.attribute || !rule.operator || !rule.value) return true; // Skip incomplete rules

        const userValue = context[rule.attribute];
        if (!userValue) return false;

        switch (rule.operator.toUpperCase()) {
            case 'EQUALS':
                return String(userValue).toLowerCase() === String(rule.value).toLowerCase();
            case 'NOT_EQUALS':
                return String(userValue).toLowerCase() !== String(rule.value).toLowerCase();
            case 'CONTAINS':
                return String(userValue).toLowerCase().includes(String(rule.value).toLowerCase());
            case 'GREATER_THAN':
                return Number(userValue) > Number(rule.value);
            case 'LESS_THAN':
                return Number(userValue) < Number(rule.value);
            case 'IN': {
                // rule.value should be a comma-separated list, e.g. "premium,enterprise"
                const allowedValues = String(rule.value).split(',').map(v => v.trim().toLowerCase());
                return allowedValues.includes(String(userValue).toLowerCase());
            }
            default:
                return false;
        }
    });

    if (!passesAttributes) return false;

    // Check percentage rollout (if a rule specifies it)
    // We assume the first rule's rollout percentage applies for simplicity in V1
    const rolloutTarget = rules[0].rollout_percentage; 
    
    if (rolloutTarget !== undefined && rolloutTarget < 100) {
        const userBucket = calculateRolloutBucket(context.userId, flagId);
        // If the target is 20%, buckets 0-19 will return true.
        return userBucket < rolloutTarget;
    }

    return true;
};