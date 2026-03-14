import crypto from 'crypto';

/**
 * Generates a consistent number between 0 and 99 based on a user ID and flag ID.
 * This ensures deterministic percentage rollouts (the same user always gets the same result for a specific flag).
 * * @function calculateRolloutBucket
 * @param {string} userId - The unique identifier of the end-user evaluating the flag.
 * @param {string} flagId - The unique identifier of the feature flag.
 * @returns {number} A deterministic integer between 0 and 99.
 */
export const calculateRolloutBucket = (userId, flagId) => {
    if (!userId) return 100; // If no user is provided, they fall outside the 0-99 bucket

    // Combine userId and flagId so the user doesn't fall into the same bucket for EVERY flag
    const hashInput = `${userId}:${flagId}`;
    
    // Create an MD5 hash, take the first 8 characters, parse as integer, and modulo 100
    const hash = crypto.createHash('md5').update(hashInput).digest('hex');
    const bucket = parseInt(hash.substring(0, 8), 16) % 100;
    
    return bucket;
};