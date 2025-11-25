const { getEnv } = require('../env');

/**
 * Starknet RPC Provider Configuration
 *
 * Providers are tried in order: Primary → Secondary → Tertiary
 *
 * Environment Variables:
 * - STARKNET_RPC: Primary endpoint (default: Lava Network)
 * - STARKNET_RPC_FALLBACK_1: Secondary endpoint (default: dRPC)
 * - STARKNET_RPC_FALLBACK_2: Tertiary endpoint (default: Chainstack if API key provided)
 * - CHAINSTACK_STARKNET_KEY: API key for Chainstack (optional)
 */

class StarknetProvider {
  constructor(name, endpoint, config = {}) {
    this.name = name;
    this.endpoint = endpoint;
    this.rateLimit = config.rateLimit || 30; // requests per second
    this.timeout = config.timeout || 10000; // 10 seconds
    this.requiresApiKey = config.requiresApiKey || false;
    this.enabled = true;

    // Health metrics
    this.stats = {
      totalRequests: 0,
      failedRequests: 0,
      successRequests: 0,
      lastFailure: null,
      lastSuccess: null,
    };
  }

  getEndpoint() {
    return this.endpoint;
  }

  recordSuccess() {
    this.stats.totalRequests++;
    this.stats.successRequests++;
    this.stats.lastSuccess = Date.now();
  }

  recordFailure(error) {
    this.stats.totalRequests++;
    this.stats.failedRequests++;
    this.stats.lastFailure = Date.now();
  }

  getErrorRate() {
    if (this.stats.totalRequests === 0) return 0;
    return this.stats.failedRequests / this.stats.totalRequests;
  }

  getStats() {
    return {
      ...this.stats,
      errorRate: this.getErrorRate(),
      name: this.name,
    };
  }
}

function initializeProviders() {
  const providers = [];

  // Primary: Lava Network (free, high limits, current default)
  const lavaEndpoint = getEnv('STARKNET_RPC') || 'https://rpc.starknet.lava.build/';
  providers.push(new StarknetProvider('lava', lavaEndpoint, {
    rateLimit: 30, // 30 req/sec per IP
    timeout: 10000,
  }));

  // Secondary: dRPC (free, public, no API key)
  const drpcEndpoint = process.env.STARKNET_RPC_FALLBACK_1 || 'https://starknet.drpc.org';
  providers.push(new StarknetProvider('drpc', drpcEndpoint, {
    rateLimit: 40, // Conservative (free tier is 40-250 RPS)
    timeout: 12000, // Slightly higher timeout (public endpoint)
  }));

  // Tertiary: Chainstack (free tier, requires API key)
  const chainstackKey = process.env.CHAINSTACK_STARKNET_KEY;
  if (chainstackKey) {
    const chainstackEndpoint = `https://starknet-mainnet.core.chainstack.com/${chainstackKey}`;
    providers.push(new StarknetProvider('chainstack', chainstackEndpoint, {
      rateLimit: 25, // Free tier: 25 RPS
      timeout: 10000,
      requiresApiKey: true,
    }));
  } else if (process.env.STARKNET_RPC_FALLBACK_2) {
    // Allow custom fallback endpoint even without Chainstack
    providers.push(new StarknetProvider('custom', process.env.STARKNET_RPC_FALLBACK_2, {
      rateLimit: 20,
      timeout: 10000,
    }));
  }

  return providers;
}

module.exports = {
  StarknetProvider,
  initializeProviders,
};
