const assert = require('node:assert/strict')
const sdk = require('@defillama/sdk')
const { getLogs } = require('./getLogs')

const lengths = [100001, 200001, 250000, 350000]

async function testLargeCacheRoundTrip(length) {
  const storage = new Map()
  const originalReadCache = sdk.cache.readCache
  const originalWriteCache = sdk.cache.writeCache
  const originalGetLogs = sdk.api.util.getLogs
  const originalLog = sdk.log
  const sourceLogs = Array.from({ length }, (_, index) => ({
    transactionHash: `0x${index.toString(16).padStart(64, '0')}`,
    logIndex: 0,
    blockNumber: 2,
  }))
  let fetchCount = 0

  sdk.cache.readCache = async key => storage.get(key) ?? {}
  sdk.cache.writeCache = async (key, value) => storage.set(key, structuredClone(value))
  sdk.api.util.getLogs = async () => {
    fetchCount++
    return { output: sourceLogs }
  }
  sdk.log = () => {}

  try {
    const api = { chain: 'ethereum', block: 3, getBlock: async () => 3 }
    const target = `0x${length.toString(16).padStart(40, '0')}`
    await getLogs({ api, target, fromBlock: 1, toBlock: 3 })
    const cachedLogs = await getLogs({ api, target, fromBlock: 1, toBlock: 3 })

    assert.equal(fetchCount, 1, 'second read should come from cache')
    assert.equal(cachedLogs.length, length, 'cache round trip should retain every log')
    assert.deepEqual(cachedLogs.map(log => log.transactionHash), sourceLogs.map(log => log.transactionHash), 'cache round trip should preserve log order')
  } finally {
    sdk.cache.readCache = originalReadCache
    sdk.cache.writeCache = originalWriteCache
    sdk.api.util.getLogs = originalGetLogs
    sdk.log = originalLog
  }
}

async function main() {
  for (const length of lengths) {
    await testLargeCacheRoundTrip(length)
    console.log(`Passed getLogs cache round trip for ${length} logs`)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
