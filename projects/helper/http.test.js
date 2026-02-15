
const { test, describe, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');
const httpHelper = require('./http');

describe('http helper', () => {
  describe('proxiedFetch', () => {
    let originalCreate;
    let originalProxyAuth;

    // Store original create method
    originalCreate = axios.create;

    beforeEach(() => {
        originalProxyAuth = process.env.PROXY_AUTH;
    });

    afterEach(() => {
        if (originalProxyAuth === undefined) {
            delete process.env.PROXY_AUTH;
        } else {
            process.env.PROXY_AUTH = originalProxyAuth;
        }
        // Restore axios.create in case a test failed to restore it or modified it
        axios.create = originalCreate;
    });

    test('should NOT disable SSL verification', async () => {
      let capturedConfig;
      let createCalled = false;

      // Mock axios.create
      axios.create = (config) => {
        capturedConfig = config;
        createCalled = true;
        return {
          get: async () => ({ data: 'success' })
        };
      };

      process.env.PROXY_AUTH = 'host:user:pass';

      // Call the function
      await httpHelper.proxiedFetch('https://example.com');

      assert.strictEqual(createCalled, true, 'axios.create should be called');

      // Verify that if httpsAgent is present, rejectUnauthorized is NOT false
      if (capturedConfig && capturedConfig.httpsAgent && capturedConfig.httpsAgent.options) {
         assert.notStrictEqual(capturedConfig.httpsAgent.options.rejectUnauthorized, false, 'rejectUnauthorized should not be false');
      } else {
         // If config is undefined or no httpsAgent, it uses default secure agent.
         assert.ok(true, 'Secure default config used');
      }
    });

    test('should verify correct proxy configuration', async () => {
      let capturedProxyConfig;

      axios.create = () => {
        return {
          get: async (url, config) => {
            capturedProxyConfig = config.proxy;
            return { data: 'success' };
          }
        };
      };

      process.env.PROXY_AUTH = 'proxy.example.com:user123:pass456';

      await httpHelper.proxiedFetch('https://target.com');

      assert.deepStrictEqual(capturedProxyConfig, {
        protocol: "https",
        host: "proxy.example.com",
        port: 8000,
        auth: { username: "user123", password: "pass456" },
      });
    });
  });
});
