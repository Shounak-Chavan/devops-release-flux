export interface UserContext {
    userId?: string;
    anonymousId?: string;
    // Allow any other custom attributes (e.g., tier, city, plan)
    [key: string]: string | number | boolean | undefined | null;
}

export interface TargetingRule {
    id?: string;
    attribute: string;
    operator: string;
    value: string;
    rollout_percentage?: number;
}

export interface FeatureFlag {
    id: string;
    name: string;
    key?: string;
    status: boolean;
    targeting_rules: TargetingRule[];
}

/**
 * Lightweight string hashing for percentage rollouts (DJB2 algorithm)
 * Provides consistent bucketing between 0 and 99.
 */
const calculateRolloutBucket = (userId: string, flagId: string): number => {
    const str = `${userId}:${flagId}`;
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash) % 100;
};

/**
 * Evaluates a user context against a flag's targeting rules entirely in the browser.
 */
export const evaluateRulesLocally = (
    context: UserContext, 
    rules: TargetingRule[], 
    flagId: string
): boolean => {
    if (!rules || rules.length === 0) return true;

    // 1. Check Attribute Matching
    const passesAttributes = rules.every(rule => {
        if (!rule.attribute || !rule.operator || !rule.value) return true;

        const userValue = context[rule.attribute];
        if (userValue === undefined || userValue === null) return false;

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
                const allowedValues = String(rule.value).split(',').map(v => v.trim().toLowerCase());
                return allowedValues.includes(String(userValue).toLowerCase());
            }
            default: 
                return false;
        }
    });

    if (!passesAttributes) return false;

    // 2. Check Percentage Rollout
    const rolloutTarget = rules[0]?.rollout_percentage;
    if (rolloutTarget !== undefined && rolloutTarget < 100) {
        // Fallback to a random session ID if userId is missing
        const bucketId = String(context.userId || context.anonymousId || 'anonymous');
        const userBucket = calculateRolloutBucket(bucketId, flagId);
        return userBucket < rolloutTarget;
    }

    return true;
};