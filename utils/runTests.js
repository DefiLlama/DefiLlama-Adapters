#!/usr/bin/env node

/**
 * Simple test runner for handleError.js
 * Run this file to execute the tests manually if Jest is not available
 */

const { handleError, classifyError } = require('./handleError');

// Simple test framework
class SimpleTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toHaveBeenCalled: () => {
        if (!actual.called) {
          throw new Error('Expected function to have been called');
        }
      }
    };
  }

  async run() {
    console.log('🧪 Running handleError.js tests...\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results:`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total: ${this.tests.length}`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Mock logger for testing
const createMockLogger = () => ({
  log: function(...args) { this.called = true; this.lastCall = args; },
  error: function(...args) { this.called = true; this.lastCall = args; },
  called: false,
  lastCall: null
});

// Initialize test runner
const test = new SimpleTest();

// Basic functionality tests
test.test('should handle basic error without crashing', () => {
  const mockLogger = createMockLogger();
  const error = new Error('Test error');
  
  const result = handleError(error, { logger: mockLogger, shouldExit: false });
  
  test.expect(result.type).toBe('UNKNOWN_ERROR');
  test.expect(result.recoverable).toBe(false);
  test.expect(mockLogger.called).toBe(true);
});

test.test('should classify GraphQL errors correctly', () => {
  const error = {
    stack: 'Error: GraphQL error\n    at graphql-request/dist/index.js:123:45',
    response: {
      errors: [
        { message: 'Field not found' },
        { message: 'Invalid query' }
      ]
    }
  };
  
  const result = classifyError(error, {});
  
  test.expect(result.type).toBe('GRAPHQL_ERROR');
  test.expect(result.recoverable).toBe(true);
  test.expect(result.details.errors).toEqual(['Field not found', 'Invalid query']);
});

test.test('should classify Axios errors correctly', () => {
  const error = {
    response: {
      status: 400,
      data: { message: 'Bad request' }
    }
  };
  
  const result = classifyError(error, {});
  
  test.expect(result.type).toBe('AXIOS_ERROR');
  test.expect(result.recoverable).toBe(true);
});

test.test('should classify timeout errors correctly', () => {
  const error = {
    code: 'ECONNABORTED',
    message: 'Request timeout'
  };
  
  const result = classifyError(error, {});
  
  test.expect(result.type).toBe('TIMEOUT_ERROR');
  test.expect(result.recoverable).toBe(true);
});

test.test('should handle server errors as non-recoverable', () => {
  const error = {
    response: {
      status: 500,
      data: { message: 'Internal server error' }
    }
  };
  
  const result = classifyError(error, {});
  
  test.expect(result.type).toBe('AXIOS_ERROR');
  test.expect(result.recoverable).toBe(false);
});

test.test('should handle unknown errors', () => {
  const error = {
    message: 'Some unknown error'
  };
  
  const result = classifyError(error, {});
  
  test.expect(result.type).toBe('UNKNOWN_ERROR');
  test.expect(result.recoverable).toBe(false);
});

test.test('should handle GraphQL errors with proper logging', () => {
  const mockLogger = createMockLogger();
  const error = {
    stack: 'Error: GraphQL error\n    at graphql-request/dist/index.js:123:45',
    response: {
      errors: [{ message: 'Test GraphQL error' }]
    },
    chain: 'ethereum'
  };
  
  const result = handleError(error, { logger: mockLogger, shouldExit: false });
  
  test.expect(result.type).toBe('GRAPHQL_ERROR');
  test.expect(mockLogger.called).toBe(true);
});

test.test('should handle context information', () => {
  const mockLogger = createMockLogger();
  const error = new Error('Test error');
  const context = {
    chain: 'ethereum',
    protocol: 'uniswap',
    adapter: 'v3'
  };
  
  const result = handleError(error, { 
    context, 
    logger: mockLogger, 
    shouldExit: false 
  });
  
  test.expect(result).toBe(result); // Just ensure it doesn't crash
  test.expect(mockLogger.called).toBe(true);
});

// Edge case tests
test.test('should handle null error', () => {
  const mockLogger = createMockLogger();
  
  const result = handleError(null, { logger: mockLogger, shouldExit: false });
  
  test.expect(result.type).toBe('UNKNOWN_ERROR');
  test.expect(mockLogger.called).toBe(true);
});

test.test('should handle undefined error', () => {
  const mockLogger = createMockLogger();
  
  const result = handleError(undefined, { logger: mockLogger, shouldExit: false });
  
  test.expect(result.type).toBe('UNKNOWN_ERROR');
  test.expect(mockLogger.called).toBe(true);
});

// Run the tests
if (require.main === module) {
  test.run().catch(console.error);
}

module.exports = { SimpleTest, createMockLogger };