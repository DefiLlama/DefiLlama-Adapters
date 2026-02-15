const { test, describe } = require('node:test');
const assert = require('node:assert');
const { i32BitsToNumber } = require('./tick');

describe('i32BitsToNumber', () => {
  test('handles positive numbers within 32-bit range', () => {
    assert.strictEqual(i32BitsToNumber(0), 0);
    assert.strictEqual(i32BitsToNumber(1), 1);
    assert.strictEqual(i32BitsToNumber(2147483647), 2147483647);
  });

  test('handles negative numbers within 32-bit range', () => {
    assert.strictEqual(i32BitsToNumber(-1), -1);
    assert.strictEqual(i32BitsToNumber(-2147483648), -2147483648);
  });

  test('handles positive overflow (wrapping)', () => {
    // 2^31 -> -2^31
    assert.strictEqual(i32BitsToNumber(2147483648), -2147483648);
    // 2^32 - 1 -> -1
    assert.strictEqual(i32BitsToNumber(4294967295), -1);
  });

  test('handles inputs as strings', () => {
    assert.strictEqual(i32BitsToNumber('2147483647'), 2147483647);
    assert.strictEqual(i32BitsToNumber('4294967295'), -1);
  });

  test('handles inputs as BigInt', () => {
    assert.strictEqual(i32BitsToNumber(2147483647n), 2147483647);
    assert.strictEqual(i32BitsToNumber(4294967295n), -1);
  });
});
