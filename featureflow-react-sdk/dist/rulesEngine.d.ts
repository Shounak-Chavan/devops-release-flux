export interface UserContext {
    userId?: string;
    anonymousId?: string;
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
 * Evaluates a user context against a flag's targeting rules entirely in the browser.
 */
export declare const evaluateRulesLocally: (context: UserContext, rules: TargetingRule[], flagId: string) => boolean;
