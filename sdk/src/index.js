/**
 * @typedef {Object} FeatureFlowOptions
 * @property {string} apiKey - The environment-specific API key provided by the FeatureFlow dashboard.
 * @property {string} [baseUrl='http://localhost:4000'] - The base URL of the FeatureFlow API (override for production).
 */

/**
 * The core client for interacting with the FeatureFlow SaaS evaluation engine.
 */
export class FeatureFlowClient {
  /**
   * Initializes the FeatureFlow SDK.
   * @param {FeatureFlowOptions} options - Configuration options.
   */
  constructor({ apiKey, baseUrl = 'http://localhost:4000' }) {
    if (!apiKey) {
      throw new Error('FeatureFlow: apiKey is required to initialize the client.');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    this.flagsCache = null; // Basic local caching for the SDK lifespan
  }

  /**
   * Fetches all flag states for the configured environment.
   * @param {Record<string, any>} [context={}] - Optional user attributes for advanced targeting rules.
   * @returns {Promise<Record<string, boolean>>} A map of flag keys to their boolean states.
   */
  async fetchAllFlags(context = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`FeatureFlow API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.flagsCache = data.flags; // Store locally to prevent redundant network calls
      return this.flagsCache;
    } catch (error) {
      console.error('FeatureFlow SDK Error:', error.message);
      return {}; // Failsafe: return empty map on network failure
    }
  }

  /**
   * Evaluates a specific feature flag.
   * @param {string} flagKey - The unique key of the flag to evaluate.
   * @param {boolean} [defaultValue=false] - The fallback value if the flag is not found or the network fails.
   * @param {Record<string, any>} [context={}] - Optional user context.
   * @returns {Promise<boolean>} The evaluated state of the flag.
   */
  async evaluate(flagKey, defaultValue = false, context = {}) {
    // If we haven't fetched flags yet, fetch them now
    if (!this.flagsCache) {
      await this.fetchAllFlags(context);
    }

    // Return the flag state from the local cache, or the default value if missing
    if (this.flagsCache && this.flagsCache[flagKey] !== undefined) {
      return this.flagsCache[flagKey];
    }

    return defaultValue;
  }
}