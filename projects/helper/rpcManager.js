/**
 * RPC Manager with circuit breaker pattern
 * Provides multi-endpoint support and automatic failover
 */

const { sleep } = require('./utils');

class CircuitBreaker {
  constructor(url, options = {}) {
    this.url = url;
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  /**
   * Record successful request - reset failure count and close circuit if in HALF_OPEN
   */
  recordSuccess() {
    this.failureCount = 0;
    this.successCount++;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  /**
   * Record failed request - increment failure count and open circuit if threshold exceeded
   * If in HALF_OPEN state, immediately reopen (fail-fast on recovery probe failure)
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // HALF_OPEN: any failure reopens immediately (recovery probe failed)
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.failureCount = 1;
      return;
    }

    // CLOSED: count failures until threshold
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Check if endpoint can be attempted
   * CLOSED/HALF_OPEN: always allow
   * OPEN: only allow after reset timeout expires
   */
  canAttempt() {
    if (this.state === 'CLOSED' || this.state === 'HALF_OPEN') {
      return true;
    }
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * Get current state metrics (for monitoring/health reports)
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}

class RPCManager {
  constructor(options = {}) {
    this.chains = new Map();
    this.retries = options.retries || 3;
    this.backoffBase = options.backoffBase || 100;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Parse RPC endpoints from environment variables
   * Supports: single, comma-separated, or numbered (CHAIN_RPC_1, CHAIN_RPC_2)
   */
  parseChainRpcs(chain) {
    const rpcs = [];
    const upperChain = chain.toUpperCase();

    // Get primary RPC from process.env
    let primaryRpc = process.env[`${upperChain}_RPC`];
    if (!primaryRpc) return rpcs;

    // Support comma-separated list
    if (primaryRpc.includes(',')) {
      return primaryRpc.split(',').map(url => url.trim()).filter(Boolean);
    }

    // Support numbered env vars (CHAIN_RPC_1, CHAIN_RPC_2, etc)
    rpcs.push(primaryRpc);
    let i = 1;
    while (true) {
      const envKey = `${upperChain}_RPC_${i}`;
      const rpc = process.env[envKey];
      if (!rpc) break;
      rpcs.push(rpc);
      i++;
    }

    return rpcs;
  }

  /**
   * Initialize circuit breakers for a chain (lazy initialization)
   */
  initChain(chain) {
    if (this.chains.has(chain)) return;

    const rpcUrls = this.parseChainRpcs(chain);
    const breakers = rpcUrls.map(url => new CircuitBreaker(url));
    this.chains.set(chain, { rpcs: rpcUrls, breakers, index: 0 });
  }

  /**
   * Select best available endpoint using round-robin with circuit breaker awareness
   * Returns null if no endpoints available
   */
  selectEndpoint(chain) {
    const endpoints = this.chains.get(chain);
    if (!endpoints) return null;

    const { breakers, rpcs, index } = endpoints;
    let attempts = 0;

    // Try to find an available endpoint (round-robin)
    while (attempts < rpcs.length) {
      const idx = (index + attempts) % rpcs.length;
      if (breakers[idx].canAttempt()) {
        endpoints.index = (idx + 1) % rpcs.length;
        return rpcs[idx];
      }
      attempts++;
    }

    // All endpoints unavailable - return null (fail-fast)
    return null;
  }

  /**
   * Redact sensitive data from RPC URL for logging/reporting
   * Masks query parameters and API keys
   */
  redactRpcUrl(url) {
    try {
      const urlObj = new URL(url);
      // Mask query params
      if (urlObj.search) {
        urlObj.search = '?[redacted]';
      }
      // Mask auth in URL path
      const redacted = urlObj.toString().replace(/([a-zA-Z0-9]{10,})/g, '[redacted]');
      return redacted.length > 50 ? redacted.substring(0, 50) + '...' : redacted;
    } catch {
      return '[invalid-url]';
    }
  }

  /**
   * Record success/failure metrics for endpoint
   */
  recordMetrics(chain, rpcUrl, success) {
    const endpoints = this.chains.get(chain);
    if (!endpoints) return;

    const { rpcs, breakers } = endpoints;
    const index = rpcs.indexOf(rpcUrl);
    if (index === -1) return;

    if (success) {
      breakers[index].recordSuccess();
    } else {
      breakers[index].recordFailure();
    }
  }

  /**
   * Execute function with automatic retry, failover, and exponential backoff
   * @param {string} chain - Chain name
   * @param {Function} fn - Function to execute with RPC URL parameter
   * @param {Object} options - Override options (retries)
   */
  async callWithRetry(chain, fn, options = {}) {
    this.initChain(chain);
    const maxRetries = options.retries || this.retries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const rpcUrl = this.selectEndpoint(chain);
      if (!rpcUrl) {
        throw new Error(`No RPC endpoints available for chain: ${chain}`);
      }

      try {
        const result = await Promise.race([
          fn(rpcUrl),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('RPC timeout')), this.timeout)
          ),
        ]);
        this.recordMetrics(chain, rpcUrl, true);
        return result;
      } catch (error) {
        this.recordMetrics(chain, rpcUrl, false);
        if (attempt === maxRetries - 1) throw error;

        const backoff = (2 ** attempt) * this.backoffBase;
        const jitter = backoff * (Math.random() - 0.5); // Jitter: ±50% of backoff
        await sleep(Math.max(10, backoff + jitter));
      }
    }
  }

  /**
   * Get RPC URL for a chain (uses selectEndpoint with fallback)
   * @param {string} chain - Chain name
   * @returns {string|null} RPC URL or null if unavailable
   */
  getRpcUrl(chain) {
    this.initChain(chain);
    return this.selectEndpoint(chain) || process.env[`${chain.toUpperCase()}_RPC`];
  }

  /**
   * Get health report for all chains (with redacted URLs for security)
   * @returns {Object} Health status per chain with endpoint states
   */
  getHealthReport() {
    const report = {};
    for (const [chain, endpoints] of this.chains) {
      const { rpcs, breakers } = endpoints;
      report[chain] = rpcs.map((rpc, i) => ({
        url: this.redactRpcUrl(rpc), // Redact credentials
        ...breakers[i].getState(),
      }));
    }
    return report;
  }

  /**
   * Manually reset circuit for an endpoint (admin/operations use)
   * @param {string} chain - Chain name
   * @param {string} rpcUrl - RPC URL to reset
   * @returns {boolean} True if reset successful
   */
  resetCircuit(chain, rpcUrl) {
    const endpoints = this.chains.get(chain);
    if (!endpoints) return false;
    const index = endpoints.rpcs.indexOf(rpcUrl);
    if (index === -1) return false;
    endpoints.breakers[index].state = 'CLOSED';
    endpoints.breakers[index].failureCount = 0;
    return true;
  }
}

const rpcManager = new RPCManager({
  retries: 3,
  backoffBase: 100,
  timeout: 30000,
});

module.exports = rpcManager;
