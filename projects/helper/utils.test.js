const { test, describe } = require('node:test');
const assert = require('node:assert');
const { createIncrementArray } = require('./utils');

describe('createIncrementArray', () => {
  test('should return an array of incrementing numbers starting from 0', () => {
    const result = createIncrementArray(5);
    assert.deepStrictEqual(result, [0, 1, 2, 3, 4]);
  });

  test('should return an empty array if length is 0', () => {
    const result = createIncrementArray(0);
    assert.deepStrictEqual(result, []);
  });

  test('should return an empty array if length is negative', () => {
    const result = createIncrementArray(-1);
    assert.deepStrictEqual(result, []);
  });

  test('should return an array of incrementing numbers if length is a string representing a number', () => {
    const result = createIncrementArray('3');
    assert.deepStrictEqual(result, [0, 1, 2]);
  });
});
