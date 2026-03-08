const test = require('node:test');
const assert = require('node:assert');
const handleError = require('../handleError');

test('handleError utility tests', async (t) => {
  let logMessages = [];
  let errorMessages = [];
  let exitCode = null;

  // Mock console.log, console.error, and process.exit
  const originalLog = console.log;
  const originalError = console.error;
  const originalExit = process.exit;

  function setupMocks() {
    logMessages = [];
    errorMessages = [];
    exitCode = null;

    console.log = (...args) => {
      logMessages.push(args.join(' '));
    };

    console.error = (...args) => {
      errorMessages.push(args.join(' '));
    };

    process.exit = (code) => {
      exitCode = code;
    };
  }

  function restoreMocks() {
    console.log = originalLog;
    console.error = originalError;
    process.exit = originalExit;
  }

  t.beforeEach(setupMocks);
  t.afterEach(restoreMocks);

  await t.test('Standard error handling', () => {
    const error = new Error('Test standard error');
    error.stack = 'Error: Test standard error\n    at Object.<anonymous> (/test/file.js:1:1)\n    at Module._compile (node:internal/modules/cjs/loader:1:1)';

    handleError(error);

    assert.strictEqual(exitCode, 1, 'process.exit should be called with 1');
    assert.ok(logMessages[0].includes('------ ERROR ------'), 'Should log error string');
    assert.strictEqual(errorMessages[0], 'Error: Test standard error', 'Should log error.toString()');
  });

  await t.test('GraphQL error without chain', () => {
    const error = new Error('GraphQL Request Error');
    error.stack = 'Error: GraphQL Request Error\n    at Request (node_modules/graphql-request/index.js:1:1)';
    error.response = {
      errors: [
        { message: 'First GraphQL Error' },
        { message: 'Second GraphQL Error' }
      ]
    };

    handleError(error);

    assert.strictEqual(exitCode, 1);
    assert.ok(logMessages[0].includes('------ ERROR ------'));
    assert.strictEqual(
      errorMessages[0],
      'On chain Unknown:First GraphQL Error\nSecond GraphQL Error',
      'Should log GraphQL errors with Unknown chain'
    );
  });

  await t.test('GraphQL error with chain', () => {
    const error = new Error('GraphQL Request Error');
    error.stack = 'Error: GraphQL Request Error\n    at Request (node_modules/graphql-request/index.js:1:1)';
    error.chain = 'ethereum';
    error.response = {
      errors: [
        { message: 'Chain specific GraphQL Error' }
      ]
    };

    handleError(error);

    assert.strictEqual(exitCode, 1);
    assert.ok(logMessages[0].includes('------ ERROR ------'));
    assert.strictEqual(
      errorMessages[0],
      'On chain ethereum:Chain specific GraphQL Error',
      'Should log GraphQL errors with specific chain'
    );
  });

  await t.test('Axios error handling', () => {
    const error = new Error('Request failed');
    error.response = {
      data: {
        message: 'Rate limit exceeded'
      }
    };
    error.stack = 'Error: Request failed\n    at axios.get (node_modules/axios/index.js:1:1)';

    handleError(error);

    assert.strictEqual(exitCode, 1);
    assert.ok(logMessages[0].includes('------ ERROR ------'));
    assert.strictEqual(errorMessages[0], 'Error: Request failed');
    assert.ok(logMessages.some(msg => msg.includes('Axios:  Rate limit exceeded')), 'Should log Axios error message');
  });

  await t.test('Stack message processing - with checkExportKeys', () => {
    const error = new Error('Test checkExportKeys');
    error.stack = 'Error: Test\n    at checkExportKeys (/test/utils.js:1:1)';

    handleError(error);

    assert.strictEqual(exitCode, 1);
    // When checkExportKeys is in stack, getStackMessage returns []
    // So "Truncated error stack:" shouldn't be logged
    assert.ok(!logMessages.some(msg => msg.includes('Truncated error stack:')));
  });

  await t.test('Stack message processing - standard filtering', () => {
    const error = new Error('Test standard filtering');
    error.stack = 'Error: Test standard filtering\n    at func (/user/project/index.js:1:1)\n  at Request (node_modules/axios/index.js:1:1)\n    at node:internal/modules/cjs/loader:1:1\n  at somethingElse (/user/project/other.js:2:2)';

    handleError(error);

    assert.strictEqual(exitCode, 1);
    assert.ok(logMessages.some(msg => msg.includes('Truncated error stack:')));
    // Find the log message that happens right after 'Truncated error stack:'
    const stackLogIndex = logMessages.findIndex(msg => msg.includes('Truncated error stack:')) + 1;
    const truncatedStack = logMessages[stackLogIndex];

    // First element should be the node_modules stack line
    assert.ok(truncatedStack.includes('node_modules/axios'));
    // internal/modules should be filtered out
    assert.ok(!truncatedStack.includes('node:internal'));
  });

  await t.test('Stack message processing - empty stack', () => {
    const error = new Error('Test empty stack');
    delete error.stack;

    handleError(error);

    assert.strictEqual(exitCode, 1);
    assert.ok(!logMessages.some(msg => msg.includes('Truncated error stack:')));
  });
});
