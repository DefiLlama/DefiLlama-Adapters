const CircuitBreaker = require('opossum');

/**
 * Circuit Breaker Configuration
 *
 * Uses Opossum library for circuit breaker pattern.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit tripped, fail fast without calling provider
 * - HALF-OPEN: Testing if provider recovered
 *
 * Configuration:
 * - timeout: 10s (max time for RPC call)
 * - errorThresholdPercentage: 50% (trip at 50% error rate)
 * - resetTimeout: 30s (cooldown before testing recovery)
 * - rollingCountTimeout: 60s (time window for stats)
 * - volumeThreshold: 10 (min requests before tripping)
 */

const CIRCUIT_BREAKER_OPTIONS = {
  timeout: 10000,              // 10 seconds - max time for RPC call
  errorThresholdPercentage: 50, // Trip circuit at 50% error rate
  resetTimeout: 30000,         // 30 seconds - cooldown before retry
  rollingCountTimeout: 60000,  // 1 minute - rolling stats window
  volumeThreshold: 10,         // Min 10 requests before circuit can trip
  name: 'starknet-rpc',        // Circuit breaker name for logging
};

/**
 * Structured logging helper
 * Follows DefiLlama standards from CLAUDE.md
 */
const log = {
  info: (msg, meta = {}) => {
    console.log(JSON.stringify({ level: 'info', message: msg, chain: 'starknet', ...meta }));
  },
  error: (msg, err, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message: msg,
      chain: 'starknet',
      error: { name: err.name, message: err.message, stack: err.stack },
      ...meta
    }));
  },
  warn: (msg, meta = {}) => {
    console.warn(JSON.stringify({ level: 'warn', message: msg, chain: 'starknet', ...meta }));
  },
  debug: (msg, meta = {}) => {
    if (process.env.DEBUG) {
      console.log(JSON.stringify({ level: 'debug', message: msg, chain: 'starknet', ...meta }));
    }
  },
};

/**
 * Creates a circuit breaker for a Starknet RPC provider
 *
 * @param {StarknetProvider} provider - Provider instance
 * @param {Function} requestFn - Async function that makes RPC request
 * @returns {CircuitBreaker} Configured circuit breaker
 */
function createCircuitBreaker(provider, requestFn) {
  const options = {
    ...CIRCUIT_BREAKER_OPTIONS,
    name: `starknet-${provider.name}`,
    timeout: provider.timeout,
  };

  const breaker = new CircuitBreaker(requestFn, options);

  // Event: Circuit opened (provider marked as down)
  breaker.on('open', () => {
    log.warn('Starknet RPC circuit opened', {
      provider: provider.name,
      errorRate: provider.getErrorRate(),
      stats: provider.getStats(),
    });
  });

  // Event: Circuit closed (provider recovered)
  breaker.on('close', () => {
    log.info('Starknet RPC circuit closed', {
      provider: provider.name,
      stats: provider.getStats(),
    });
  });

  // Event: Circuit half-open (testing recovery)
  breaker.on('halfOpen', () => {
    log.debug('Starknet RPC circuit half-open', {
      provider: provider.name,
      testingRecovery: true,
    });
  });

  // Event: Request succeeded
  breaker.on('success', () => {
    provider.recordSuccess();
    log.debug('Starknet RPC request succeeded', {
      provider: provider.name,
      stats: provider.getStats(),
    });
  });

  // Event: Request failed
  breaker.on('failure', (error) => {
    provider.recordFailure(error);
    log.error('Starknet RPC request failed', error, {
      provider: provider.name,
      stats: provider.getStats(),
    });
  });

  // Event: Timeout
  breaker.on('timeout', () => {
    log.warn('Starknet RPC request timeout', {
      provider: provider.name,
      timeout: provider.timeout,
    });
  });

  // Event: Circuit rejects request (fail fast)
  breaker.on('reject', () => {
    log.debug('Starknet RPC request rejected', {
      provider: provider.name,
      reason: 'Circuit open',
    });
  });

  return breaker;
}

module.exports = {
  createCircuitBreaker,
  log,
};
