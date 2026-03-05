import { calculateRolloutBucket, evaluateTargetingRules, resolveFlagState } from '../services/rulesEngine.js';
import { jest, describe, it, expect } from '@jest/globals';

describe('Rules Engine Unit Tests', () => {

  describe('calculateRolloutBucket', () => {
    it('should deterministically return the same bucket for the same user and flag', () => {
      const bucket1 = calculateRolloutBucket('user_123', 'new-checkout');
      const bucket2 = calculateRolloutBucket('user_123', 'new-checkout');
      expect(bucket1).toBe(bucket2);
    });

    it('should return different buckets for different users', () => {
      const bucket1 = calculateRolloutBucket('user_123', 'new-checkout');
      const bucket2 = calculateRolloutBucket('user_456', 'new-checkout');
      // While technically possible to collide, it's highly unlikely. 
      // This test ensures the hash input changes the output.
      expect(bucket1).not.toBe(bucket2); 
    });

    it('should return > 100 for anonymous users to fail rollouts', () => {
      const bucket = calculateRolloutBucket(null, 'new-checkout');
      expect(bucket).toBe(101);
    });
  });

  describe('evaluateTargetingRules', () => {
    it('should return true if context matches an "equals" rule', () => {
      const rules = [{ attribute: 'tier', operator: 'equals', value: 'premium' }];
      const context = { tier: 'premium' };
      expect(evaluateTargetingRules(rules, context)).toBe(true);
    });

    it('should return false if context does not match an "equals" rule', () => {
      const rules = [{ attribute: 'tier', operator: 'equals', value: 'premium' }];
      const context = { tier: 'free' };
      expect(evaluateTargetingRules(rules, context)).toBe(false);
    });

    it('should return true if context matches an "in" rule', () => {
      const rules = [{ attribute: 'region', operator: 'in', value: ['US', 'IN', 'UK'] }];
      const context = { region: 'IN' };
      expect(evaluateTargetingRules(rules, context)).toBe(true);
    });
  });

  describe('resolveFlagState', () => {
    it('should return false if the master switch is completely disabled', () => {
      const state = { isEnabled: false, rolloutPercentage: 100 };
      expect(resolveFlagState(state, { userId: '123' })).toBe(false);
    });

    it('should return true if a targeting rule matches, bypassing rollout percentage', () => {
      const state = {
        isEnabled: true,
        rolloutPercentage: 0, // 0% rollout means nobody gets it normally
        rulesJson: [{ attribute: 'isInternal', operator: 'equals', value: true }]
      };
      // But because they match the internal rule, they get it anyway!
      expect(resolveFlagState(state, { userId: '123', isInternal: true })).toBe(true);
    });

    it('should return true if flag is 100% rollout and enabled', () => {
      const state = { isEnabled: true, rolloutPercentage: 100 };
      expect(resolveFlagState(state, { userId: '123' })).toBe(true);
    });
  });
});