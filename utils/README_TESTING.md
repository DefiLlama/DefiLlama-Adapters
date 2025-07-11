# Testing handleError.js

This directory contains comprehensive test cases for the `handleError.js` utility function.

## Test Files

- `handleError.test.js` - Jest-based comprehensive test suite
- `runTests.js` - Simple standalone test runner (no dependencies required)

## Running Tests

### Option 1: Using Jest (Recommended)

First, install Jest if not already installed:

```bash
npm install --save-dev jest
```

Then run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only handleError tests
npx jest handleError.test.js
```

### Option 2: Using the Simple Test Runner

If Jest is not available, you can use the standalone test runner:

```bash
node utils/runTests.js
```

## Test Coverage

The test suite covers the following scenarios:

### Basic Functionality
- ✅ Basic error handling without options
- ✅ Process exit behavior (shouldExit option)
- ✅ Custom logger usage
- ✅ Return value structure

### Error Classification
- ✅ GraphQL errors with proper stack trace detection
- ✅ Axios/HTTP errors with status code handling
- ✅ Timeout errors (both ECONNABORTED and message-based)
- ✅ Unknown/generic errors

### GraphQL Error Handling
- ✅ Multiple GraphQL errors in response
- ✅ Chain information from error object
- ✅ Chain information from context
- ✅ Proper error message formatting

### Axios Error Handling
- ✅ Recoverable errors (4xx status codes)
- ✅ Non-recoverable errors (5xx status codes)
- ✅ Error message extraction from response
- ✅ Fallback to error.message when response data unavailable

### Timeout Error Handling
- ✅ ECONNABORTED error code detection
- ✅ Timeout keyword in error message
- ✅ Proper classification as recoverable

### Context and Logging
- ✅ Context information processing
- ✅ Custom logger integration
- ✅ Structured log data creation
- ✅ Chain/protocol/adapter information handling

### Stack Trace Processing
- ✅ Node modules filtering (except defillama)
- ✅ Stack depth limiting (max 10 lines)
- ✅ checkExportKeys error filtering
- ✅ includeNodeModules context option
- ✅ Empty/null stack handling

### Edge Cases
- ✅ Null/undefined error handling
- ✅ Partial error object structures
- ✅ Missing required properties
- ✅ Malformed error responses

## Test Structure

Each test follows this pattern:

```javascript
test('should describe what it tests', () => {
  // Arrange - Set up test data
  const mockLogger = createMockLogger();
  const error = new Error('Test error');
  
  // Act - Execute the function
  const result = handleError(error, { logger: mockLogger });
  
  // Assert - Verify the results
  expect(result.type).toBe('UNKNOWN_ERROR');
  expect(mockLogger.error).toHaveBeenCalled();
});
```

## Mock Objects

The tests use mock objects to avoid side effects:

- **Mock Logger**: Captures log calls without actual console output
- **Mock process.exit**: Prevents test process termination
- **Mock Error Objects**: Simulate various error conditions

## Expected Test Results

When all tests pass, you should see output similar to:

```
✅ Basic functionality tests (4 tests)
✅ GraphQL error handling (3 tests)
✅ Axios error handling (4 tests)
✅ Timeout error handling (2 tests)
✅ Context handling (1 test)
✅ Stack trace handling (5 tests)
✅ Edge cases (6 tests)

📊 Total: 25 tests passed
```

## Troubleshooting

### Common Issues

1. **Jest not found**: Install Jest with `npm install --save-dev jest`
2. **Process exit in tests**: The tests mock `process.exit` to prevent termination
3. **Console output during tests**: Use the mock logger to capture output

### Adding New Tests

To add new test cases:

1. Add them to `handleError.test.js` for Jest
2. Add them to `runTests.js` for the simple runner
3. Follow the existing test patterns
4. Include both positive and negative test cases
5. Test edge cases and error conditions

## Performance Considerations

The tests are designed to run quickly:
- No actual network requests
- No file system operations
- Minimal setup/teardown
- Focused test scope

Total test execution time should be under 1 second.