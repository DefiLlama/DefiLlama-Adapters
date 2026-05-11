const assert = require('assert')

const { getRunFiles, parseFileList } = require('./getFileList')

assert.deepStrictEqual(parseFileList(''), [])
assert.deepStrictEqual(parseFileList('["projects/minswap/index.js"]'), ['projects/minswap/index.js'])
assert.deepStrictEqual(parseFileList('[ projects/minswap/index.js, projects/velodrome/index.js ]'), ['projects/minswap/index.js', 'projects/velodrome/index.js'])
assert.deepStrictEqual(parseFileList('["projects/minswap/index.js", "projects/velodrome/index.js"]'), ['projects/minswap/index.js', 'projects/velodrome/index.js'])

assert.deepStrictEqual(getRunFiles({
  modified: '["projects/minswap/index.js"]',
  added: '[]',
}), ['projects/minswap'])

assert.deepStrictEqual(getRunFiles({
  modified: '[]',
  added: '["projects/new-adapter/index.js"]',
}), ['projects/new-adapter'])

assert.deepStrictEqual(getRunFiles({
  modified: '["projects/treasury/olympus.js", "projects/entities/binance.js"]',
  added: '[]',
}), ['projects/treasury/olympus.js', 'projects/entities/binance.js'])

assert.deepStrictEqual(getRunFiles({
  modified: '["projects/helper/unwrapLPs.js", "projects/config/constants.js"]',
  added: '[]',
}), [])

assert.deepStrictEqual(getRunFiles({
  modified: '["registries/yield.js"]',
  added: '[]',
  readDiff: () => `diff --git a/registries/yield.js b/registries/yield.js
+  "beefy": {
+  'yearn-v2': {
+  symbol: "ignored",
`,
}), ['beefy', 'yearn-v2'])

assert.deepStrictEqual(getRunFiles({
  modified: '["registries/index.js", "registries/utils.js"]',
  added: '[]',
  readDiff: () => { throw new Error('should not read ignored registry files') },
}), [])

console.log('getFileList tests passed')
