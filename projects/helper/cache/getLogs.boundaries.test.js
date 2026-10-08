const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { test } = require('node:test')
const { runInNewContext } = require('node:vm')

const source = readFileSync(require.resolve('./getLogs'), 'utf8')
const logs = [10, 20, 30, 40].map(blockNumber => ({
  blockNumber,
  transactionHash: `0x${blockNumber}`,
  logIndex: 0,
}))

function loadGetLogs(cache, rpcCalls) {
  const dependencies = {
    '../cache': {
      getCache: async () => cache,
      setCache: async () => {},
    },
    '@defillama/sdk': {
      api: { util: { getLogs: async params => {
        rpcCalls.push(params)
        return { output: logs.filter(log => log.blockNumber >= params.fromBlock && log.blockNumber <= params.toBlock) }
      } } },
    },
    axios: {},
    ethers: {},
  }
  const context = { module: { exports: {} }, require: name => dependencies[name] }
  runInNewContext(source, context)
  return context.module.exports.getLogs
}

for (const warmCache of [false, true]) {
  test(`includes both block boundaries with ${warmCache ? 'warm' : 'cold'} cache`, async () => {
    const cache = warmCache ? { fromBlock: 1, toBlock: 50, logs } : { logs: [] }
    const rpcCalls = []
    const getLogs = loadGetLogs(cache, rpcCalls)
    const result = await getLogs({
      api: { chain: 'ethereum', block: 30, getBlock: async () => 30 },
      target: '0x0000000000000000000000000000000000000001',
      fromBlock: 20,
      useIndexer: false,
    })

    assert.deepEqual(Array.from(result, log => log.blockNumber), [20, 30])
    assert.equal(rpcCalls.length, warmCache ? 0 : 1)
  })
}
