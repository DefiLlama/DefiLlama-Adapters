const test = require('node:test');
const assert = require('node:assert');
const stringify = require('../compactStringify');

test('compactStringify tests', async (t) => {
  await t.test('handles objects with toJSON', () => {
    const obj = {
      toJSON() {
        return { foo: 'bar' };
      }
    };
    assert.strictEqual(stringify(obj), '{"foo": "bar"}');
  });

  await t.test('handles undefined stringified result (like functions)', () => {
    assert.strictEqual(stringify(function() {}), undefined);
  });

  await t.test('handles arrays with undefined items', () => {
    const arr = [1, function() {}, 3];
    assert.strictEqual(stringify(arr), '[1, null, 3]');
  });

  await t.test('handles object with undefined values', () => {
    const obj = { a: 1, b: function() {}, c: 3 };
    assert.strictEqual(stringify(obj), '{"a": 1, "c": 3}');
  });

  await t.test('handles custom replacer function', () => {
    const obj = { a: 1, b: 2 };
    const replacer = (key, value) => key === 'a' ? undefined : value;
    assert.strictEqual(stringify(obj, { replacer }), '{"b": 2}');
  });

  await t.test('formats objects that go beyond maxLength', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
    const expected = `{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4,\n  "e": 5,\n  "f": 6,\n  "g": 7,\n  "h": 8,\n  "i": 9,\n  "j": 10\n}`;
    assert.strictEqual(stringify(obj, { maxLength: 10 }), expected);
  });

  await t.test('formats arrays that go beyond maxLength', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const expected = `[\n  1,\n  2,\n  3,\n  4,\n  5,\n  6,\n  7,\n  8,\n  9,\n  10\n]`;
    assert.strictEqual(stringify(arr, { maxLength: 5 }), expected);
  });

  await t.test('handles replacer array', () => {
    const obj = { a: 1, b: 2, c: 3 };
    assert.strictEqual(stringify(obj, { replacer: ['a', 'c'] }), '{"a": 1, "c": 3}');
  });

  await t.test('handles string values', () => {
    assert.strictEqual(stringify("test:string,here"), '"test:string,here"');
  });

  await t.test('handles empty object fallback', () => {
    const obj = {};
    assert.strictEqual(stringify(obj, { maxLength: -1 }), '{}');
  });

  await t.test('handles empty array fallback', () => {
    const arr = [];
    assert.strictEqual(stringify(arr, { maxLength: -1 }), '[]');
  });

  await t.test('edge case: string.length <= length but prettified.length > length', () => {
    // string="[1,2]", length=5. length <= 5 is true.
    // prettified="[1, 2]", length=6. 6 <= 5 is false.
    // should fall back to non-prettified layout, i.e., expanding.
    const arr = [1, 2];
    const expected = `[\n  1,\n  2\n]`;
    assert.strictEqual(stringify(arr, { maxLength: 5 }), expected);
  });

  await t.test('handles indent = 0', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
    // with indent = 0, indent slices to ""
    // which results in maxLength = Infinity
    // which means it formats nicely inline as a string replacement
    const expected = `{"a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8, "i": 9, "j": 10}`;
    assert.strictEqual(stringify(obj, { indent: 0, maxLength: 5 }), expected);
  });

  await t.test('handles object with toJSON returning primitive', () => {
    const obj = {
      toJSON() { return 42; }
    };
    assert.strictEqual(stringify(obj), '42');
  });

  await t.test('handles object with toJSON returning another toJSON object', () => {
    const obj = {
      toJSON() {
        return {
          toJSON() {
            return { a: 1 };
          }
        };
      }
    };
    // Note: toJSON is not called recursively in stringify. JSON.stringify handles it if needed.
    // Let's just check what JSON.stringify does.
    assert.strictEqual(stringify(obj), '{"a": 1}');
  });

  await t.test('handles string literal match with prettified', () => {
    const obj = { a: "string:with,chars" };
    assert.strictEqual(stringify(obj), '{"a": "string:with,chars"}');
  });
});
