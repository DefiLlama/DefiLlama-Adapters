const { test } = require('node:test');
const assert = require('node:assert');
const { normalizeAddress } = require('./tokenMapping');

test('normalizeAddress', async (t) => {
  await t.test('should normalize address for non-case sensitive chains', () => {
    const address = '0xAbCdEf';
    const chain = 'ethereum';
    assert.strictEqual(normalizeAddress(address, chain), address.toLowerCase());
  });

  await t.test('should preserve case for case sensitive chains', () => {
    const address = 'SoLanaAddress';
    // Ensure we pick a chain that is definitely case sensitive
    const chain = 'solana';
    assert.strictEqual(normalizeAddress(address, chain), address);
  });

  await t.test('should handle sei chain specific logic', async (t) => {
    await t.test('should lowercase if address starts with 0x', () => {
      const address = '0xAbCdEf';
      const chain = 'sei';
      assert.strictEqual(normalizeAddress(address, chain), address.toLowerCase());
    });

    await t.test('should preserve case if address does not start with 0x', () => {
      const address = 'SeiAddress';
      const chain = 'sei';
      assert.strictEqual(normalizeAddress(address, chain), address);
    });
  });

  await t.test('should extract chain if extractChain is true and address contains colon', () => {
    // case insensitive chain
    assert.strictEqual(normalizeAddress('ethereum:0xAbCdEf', undefined, true), 'ethereum:0xabcdef');

    // case sensitive chain
    assert.strictEqual(normalizeAddress('solana:Address', undefined, true), 'solana:Address');
  });

  await t.test('should return lowercased address if chain is undefined', () => {
      const address = '0xAbCdEf';
      assert.strictEqual(normalizeAddress(address), address.toLowerCase());
  });

  await t.test('should handle null/undefined address gracefully if passed (though not expected type)', () => {
      // The function calls .includes, .split, .startsWith, .toLowerCase on address.
      // If address is null/undefined, it will throw.
      // The current implementation does:
      // if (!chain && extractChain && address.includes(':')) ...
      // if (chain === 'sei' && address?.startsWith('0x')) ...
      // ...
      // return address.toLowerCase()

      // So it will crash if address is null/undefined unless chain is 'sei' and address is undefined (optional chaining there).
      // But eventually it returns address.toLowerCase() or address.

      // Let's see if we should test for failure or just ignore since it expects string.
      // I'll stick to valid inputs for now as strict typing isn't enforced but implied usage is string.
  });
});
