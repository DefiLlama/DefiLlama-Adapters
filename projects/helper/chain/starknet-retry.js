/**
 * Exponential Backoff Retry Logic
 *
 * Implements retry with exponential backoff and jitter to prevent thundering herd.
 *
 * Configuration:
 * - maxRetries: 2 (total 3 attempts: original + 2 retries)
 * - initialDelay: 1000ms (1 second)
 * - maxDelay: 8000ms (8 seconds)
 * - jitter: ±30% randomization
 *
 * Example retry delays:
 * - Attempt 1: Immediate
 * - Attempt 2: 1000ms ± 300ms (700-1300ms)
 * - Attempt 3: 2000ms ± 600ms (1400-2600ms)
 */

const { log } = require('./starknet-circuit');

const RETRY_CONFIG = {
  maxRetries: 2,           // Total 3 attempts (original + 2 retries)
  initialDelay: 1000,      // 1 second base delay
  maxDelay: 8000,          // 8 seconds max delay
  jitterPercentage: 0.3,   // ±30% randomization
};

/**
 * Calculate delay with exponential backoff and jitter
 *
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt) {
  const { initialDelay, maxDelay, jitterPercentage } = RETRY_CONFIG;

  // Exponential: delay = initial * 2^attempt
  const exponentialDelay = initialDelay * Math.pow(2, attempt);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (±30%)
  const jitterRange = cappedDelay * jitterPercentage;
  const jitter = (Math.random() * 2 - 1) * jitterRange; // Random between -jitterRange and +jitterRange

  return Math.max(0, cappedDelay + jitter);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} context - Context object for logging (provider name, etc.)
 * @returns {Promise<any>} Result from successful attempt
 * @throws {Error} Last error if all retries exhausted
 */
async function retryWithBackoff(fn, context = {}) {
  const { maxRetries } = RETRY_CONFIG;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add delay before retry (skip on first attempt)
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1);
        log.debug('Retrying with exponential backoff', {
          ...context,
          attempt: attempt + 1,
          totalAttempts: maxRetries + 1,
          delayMs: Math.round(delay),
        });
        await sleep(delay);
      }

      // Attempt request
      const result = await fn();

      // Success
      if (attempt > 0) {
        log.info('Retry succeeded', {
          ...context,
          attempt: attempt + 1,
          totalAttempts: maxRetries + 1,
        });
      }

      return result;

    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        log.warn('Request failed, will retry', {
          ...context,
          attempt: attempt + 1,
          totalAttempts: maxRetries + 1,
          error: error.message,
          remainingRetries: maxRetries - attempt,
        });
      } else {
        log.error('All retry attempts exhausted', error, {
          ...context,
          totalAttempts: maxRetries + 1,
        });
      }
    }
  }

  // All retries failed
  throw lastError;
}

module.exports = {
  retryWithBackoff,
  calculateDelay,
  RETRY_CONFIG,
};
