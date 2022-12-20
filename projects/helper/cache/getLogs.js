
const { getCache, setCache, } = require('../cache');
const { getBlock, } = require('../http')
const sdk = require('@defillama/sdk')

const cacheFolder = 'logs'

async function getLogs({ chain = 'ethereum', target,
  topic, keys = [], fromBlock, toBlock, topics,
  timestamp, chainBlocks, }) {
  if (!target) throw new Error('Missing target!')
  if (!fromBlock) throw new Error('Missing fromBlock!')
  if (!toBlock)
    toBlock = await getBlock(timestamp, chain, chainBlocks)

  target = target.toLowerCase()
  const key = `${chain}/${target}`

  let cache = await _getCache(key)

  // if no new data nees to be fetched
  if (cache.fromBlock && cache.toBlock > toBlock)
    return cache.logs.filter(i => i.blockNumber < toBlock && i.blockNumber >= fromBlock)

  cache.fromBlock = fromBlock
  fromBlock = cache.toBlock ?? fromBlock

  const logs = (await sdk.api.util.getLogs({
    chain, target, topic, keys, topics, fromBlock, toBlock,
  })).output

  cache.logs.push(...logs)
  cache.toBlock = toBlock

  const logIndices  = new Set()

  // remove possible duplicates
  cache.logs = cache.logs.filter(i => {
    let key = i.transactionHash + i.logIndex
    if (!i.hasOwnProperty('logIndex') || !i.hasOwnProperty('transactionHash')) {
      sdk.log(i)
      throw new Error('Missing crucial field')
    }
    if (logIndices.has(key)) return false
    logIndices.add(key)
    return true
  })

  await setCache(cacheFolder, key, cache)

  return cache.logs

  async function _getCache(key) {
    let cache = await getCache(cacheFolder, key)
    // set initial structure if it is missing / reset if from block is moved to something older
    if (!cache.logs || fromBlock < cache.fromBlock) {
      cache = {
        logs: []
      }
    }
    
    return cache
  }
}

module.exports = {
  getLogs
}