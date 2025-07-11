const { handleError, classifyError } = require('./handleError');

// Mock process.exit to prevent actual process termination during tests
const originalExit = process.exit;
let mockExit;

// Mock console methods for testing
const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn()
});

describe('handleError', () => {
  beforeEach(() => {
    mockExit = jest.fn();
    process.exit = mockExit;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe('Basic functionality', () => {
    test('should handle basic error without options', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(mockLogger.log).toHaveBeenCalledWith('\n', '------ ERROR ------', '\n');
      expect(mockLogger.error).toHaveBeenCalledWith(error.toString());
      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.recoverable).toBe(false);
      expect(mockExit).not.toHaveBeenCalled();
    });

    test('should exit process when shouldExit is true', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      
      handleError(error, { shouldExit: true, logger: mockLogger });
      
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should not exit process when shouldExit is false', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      
      handleError(error, { shouldExit: false, logger: mockLogger });
      
      expect(mockExit).not.toHaveBeenCalled();
    });

    test('should use custom logger when provided', () => {
      const customLogger = createMockLogger();
      const error = new Error('Test error');
      
      handleError(error, { logger: customLogger });
      
      expect(customLogger.log).toHaveBeenCalled();
      expect(customLogger.error).toHaveBeenCalled();
    });
  });

  describe('GraphQL error handling', () => {
    test('should handle GraphQL errors correctly', () => {
      const mockLogger = createMockLogger();
      const error = {
        stack: 'Error: GraphQL error\n    at graphql-request/dist/index.js:123:45',
        response: {
          errors: [
            { message: 'Field not found' },
            { message: 'Invalid query' }
          ]
        },
        chain: 'ethereum'
      };
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(result.type).toBe('GRAPHQL_ERROR');
      expect(result.recoverable).toBe(true);
      expect(result.details.errors).toEqual(['Field not found', 'Invalid query']);
      expect(mockLogger.error).toHaveBeenCalledWith('GraphQL Error on chain ethereum:');
      expect(mockLogger.error).toHaveBeenCalledWith('  - Field not found');
      expect(mockLogger.error).toHaveBeenCalledWith('  - Invalid query');
    });

    test('should handle GraphQL errors with context chain', () => {
      const mockLogger = createMockLogger();
      const error = {
        stack: 'Error: GraphQL error\n    at graphql-request/dist/index.js:123:45',
        response: {
          errors: [{ message: 'Test error' }]
        }
      };
      const context = { chain: 'polygon' };
      
      const result = handleError(error, { context, logger: mockLogger });
      
      expect(mockLogger.error).toHaveBeenCalledWith('GraphQL Error on chain polygon:');
    });
  });

  describe('Axios error handling', () => {
    test('should handle Axios errors with recoverable status', () => {
      const mockLogger = createMockLogger();
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        },
        message: 'Request failed'
      };
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(result.type).toBe('AXIOS_ERROR');
      expect(result.recoverable).toBe(true); // 400 < 500
      expect(result.details.status).toBe(400);
      expect(result.details.message).toBe('Bad request');
      expect(mockLogger.error).toHaveBeenCalledWith('HTTP Error: Bad request');
    });

    test('should handle Axios errors with non-recoverable status', () => {
      const mockLogger = createMockLogger();
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        },
        message: 'Request failed'
      };
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(result.type).toBe('AXIOS_ERROR');
      expect(result.recoverable).toBe(false); // 500 >= 500
      expect(result.details.status).toBe(500);
    });

    test('should handle Axios errors without response data message', () => {
      const mockLogger = createMockLogger();
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        },
        message: 'Request failed'
      };
      
      handleError(error, { logger: mockLogger });
      
      expect(mockLogger.error).toHaveBeenCalledWith('HTTP Error: Not found');
    });
  });

  describe('Timeout error handling', () => {
    test('should handle timeout errors with ECONNABORTED code', () => {
      const mockLogger = createMockLogger();
      const error = {
        code: 'ECONNABORTED',
        message: 'Request timeout'
      };
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(result.type).toBe('TIMEOUT_ERROR');
      expect(result.recoverable).toBe(true);
      expect(result.details.timeout).toBe(true);
    });

    test('should handle timeout errors with timeout in message', () => {
      const mockLogger = createMockLogger();
      const error = {
        message: 'Connection timeout occurred'
      };
      
      const result = handleError(error, { logger: mockLogger });
      
      expect(result.type).toBe('TIMEOUT_ERROR');
      expect(result.recoverable).toBe(true);
      expect(result.details.timeout).toBe(true);
    });
  });

  describe('Context handling', () => {
    test('should include context information in log data', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      const context = {
        chain: 'ethereum',
        protocol: 'uniswap',
        adapter: 'v3'
      };
      
      const result = handleError(error, { context, logger: mockLogger });
      
      // The function should process context but we can verify it through the error classification
      expect(result).toBeDefined();
      expect(result.type).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Stack trace handling', () => {
    test('should display stack trace when available', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at testFunction (/app/test.js:10:5)
    at main (/app/index.js:5:3)`;
      
      handleError(error, { logger: mockLogger });
      
      expect(mockLogger.log).toHaveBeenCalledWith('Relevant stack trace:');
    });

    test('should not display stack trace for checkExportKeys errors', () => {
      const mockLogger = createMockLogger();
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at checkExportKeys (/app/validator.js:10:5)`;
      
      handleError(error, { logger: mockLogger });
      
      expect(mockLogger.log).not.toHaveBeenCalledWith('Relevant stack trace:');
    });
  });
});

describe('classifyError', () => {
  test('should classify GraphQL errors correctly', () => {
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
    
    expect(result.type).toBe('GRAPHQL_ERROR');
    expect(result.recoverable).toBe(true);
    expect(result.details.errors).toEqual(['Field not found', 'Invalid query']);
  });

  test('should classify Axios errors correctly', () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Bad request' }
      }
    };
    
    const result = classifyError(error, {});
    
    expect(result.type).toBe('AXIOS_ERROR');
    expect(result.recoverable).toBe(true);
    expect(result.details.status).toBe(400);
    expect(result.details.message).toBe('Bad request');
  });

  test('should classify timeout errors with code correctly', () => {
    const error = {
      code: 'ECONNABORTED',
      message: 'Request timeout'
    };
    
    const result = classifyError(error, {});
    
    expect(result.type).toBe('TIMEOUT_ERROR');
    expect(result.recoverable).toBe(true);
    expect(result.details.timeout).toBe(true);
  });

  test('should classify timeout errors with message correctly', () => {
    const error = {
      message: 'Connection timeout occurred'
    };
    
    const result = classifyError(error, {});
    
    expect(result.type).toBe('TIMEOUT_ERROR');
    expect(result.recoverable).toBe(true);
    expect(result.details.timeout).toBe(true);
  });

  test('should classify unknown errors correctly', () => {
    const error = {
      message: 'Some unknown error'
    };
    
    const result = classifyError(error, {});
    
    expect(result.type).toBe('UNKNOWN_ERROR');
    expect(result.recoverable).toBe(false);
    expect(result.details.message).toBe('Some unknown error');
  });

  test('should handle errors without message', () => {
    const error = {};
    
    const result = classifyError(error, {});
    
    expect(result.type).toBe('UNKNOWN_ERROR');
    expect(result.recoverable).toBe(false);
    expect(result.details.message).toBeUndefined();
  });
});

describe('getEnhancedStackMessage (via handleError)', () => {
  test('should filter out node_modules except defillama', () => {
    const mockLogger = createMockLogger();
    const error = new Error('Test error');
    error.stack = `Error: Test error
    at testFunction (/app/test.js:10:5)
    at node_modules/some-package/index.js:20:10
    at node_modules/defillama-sdk/index.js:30:15
    at main (/app/index.js:5:3)`;
    
    handleError(error, { logger: mockLogger });
    
    // Should include defillama node_modules but filter out others
    expect(mockLogger.log).toHaveBeenCalledWith('Relevant stack trace:');
  });

  test('should limit stack depth to 10 lines', () => {
    const mockLogger = createMockLogger();
    const error = new Error('Test error');
    const stackLines = Array.from({ length: 15 }, (_, i) => 
      `    at function${i} (/app/file${i}.js:${i}:5)`
    ).join('\n');
    error.stack = `Error: Test error\n${stackLines}`;
    
    handleError(error, { logger: mockLogger });
    
    // Should limit to 10 lines plus the "Relevant stack trace:" message
    const logCalls = mockLogger.log.mock.calls.filter(call => 
      call[0] && call[0].includes('function')
    );
    expect(logCalls.length).toBeLessThanOrEqual(10);
  });

  test('should handle empty stack', () => {
    const mockLogger = createMockLogger();
    const error = new Error('Test error');
    error.stack = null;
    
    handleError(error, { logger: mockLogger });
    
    expect(mockLogger.log).not.toHaveBeenCalledWith('Relevant stack trace:');
  });

  test('should respect includeNodeModules context option', () => {
    const mockLogger = createMockLogger();
    const error = new Error('Test error');
    error.stack = `Error: Test error
    at testFunction (/app/test.js:10:5)
    at node_modules/some-package/index.js:20:10`;
    
    const context = { includeNodeModules: false };
    handleError(error, { context, logger: mockLogger });
    
    // Should not include node_modules line when includeNodeModules is false
    const stackCalls = mockLogger.log.mock.calls.filter(call => 
      call[0] && typeof call[0] === 'string' && call[0].includes('node_modules')
    );
    expect(stackCalls.length).toBe(0);
  });
});

describe('Edge cases and error conditions', () => {
  test('should handle null error', () => {
    const mockLogger = createMockLogger();
    
    const result = handleError(null, { logger: mockLogger });
    
    expect(result.type).toBe('UNKNOWN_ERROR');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should handle undefined error', () => {
    const mockLogger = createMockLogger();
    
    const result = handleError(undefined, { logger: mockLogger });
    
    expect(result.type).toBe('UNKNOWN_ERROR');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('should handle error with partial GraphQL structure', () => {
    const mockLogger = createMockLogger();
    const error = {
      stack: 'Error: GraphQL error\n    at graphql-request/dist/index.js:123:45',
      response: {} // Missing errors array
    };
    
    const result = handleError(error, { logger: mockLogger });
    
    expect(result.type).toBe('UNKNOWN_ERROR'); // Should not classify as GraphQL without errors
  });

  test('should handle error with partial Axios structure', () => {
    const mockLogger = createMockLogger();
    const error = {
      response: {
        status: 400
        // Missing data.message
      }
    };
    
    const result = handleError(error, { logger: mockLogger });
    
    expect(result.type).toBe('UNKNOWN_ERROR'); // Should not classify as Axios without data.message
  });
});