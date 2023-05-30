
const { getCache, setCache, } = require('../cache');
const sdk = require('@defillama/sdk')
const ethers = require("ethers")

const cacheFolder = 'logs'

async function getLogs({ target,
  topic, keys = [], fromBlock, toBlock, topics,
  api, eventAbi, onlyArgs = false, extraKey, skipCache = false, }) {
  if (!api) throw new Error('Missing sdk api object!')
  if (!target) throw new Error('Missing target!')
  if (!fromBlock) throw new Error('Missing fromBlock!')
  await api.getBlock()
  const block = api.block
  const chain = api.chain ?? 'ethereum'
  if (!toBlock) toBlock = block
  if (!toBlock) throw new Error('Missing fromBlock!')

  let iface

  if (eventAbi) {
    iface = new ethers.utils.Interface([eventAbi])
    if (typeof eventAbi === 'object')
      sdk.log(iface.format(ethers.utils.FormatTypes.full))
  }

  target = target.toLowerCase()
  const key = extraKey ? `${chain}/${target}-${extraKey}` : `${chain}/${target}`

  let cache = await _getCache(key)
  let response

  // if no new data nees to be fetched
  if (cache.fromBlock && cache.toBlock > toBlock)
    response = cache.logs.filter(i => i.blockNumber < toBlock && i.blockNumber >= fromBlock)
  else
    response = await fetchLogs()

  if (!eventAbi) return response

  return response.map((log) => {
    const res = iface.parseLog(log)
    if (onlyArgs) return res.args
    res.topics = log.topics.map(i => `0x${i.slice(26)}`)
    return res
  })

  async function fetchLogs() {
    cache.fromBlock = fromBlock
    fromBlock = cache.toBlock ?? fromBlock

    const logs = (await sdk.api.util.getLogs({
      chain, target, topic, keys, topics, fromBlock, toBlock,
    })).output

    cache.logs.push(...logs)
    cache.toBlock = toBlock

    const logIndices = new Set()

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

    if (!skipCache)
      await setCache(cacheFolder, key, cache)

    return cache.logs
  }

  async function _getCache(key) {
    const defaultRes = {
      logs: []
    }

    if (skipCache) return defaultRes

    let cache = await getCache(cacheFolder, key)
    // set initial structure if it is missing / reset if from block is moved to something older
    if (!cache.logs || fromBlock < cache.fromBlock) {
      return defaultRes
    }

    return cache
  }
}

module.exports = {
  getLogs,
  getAddress: s => "0x" + s.slice(26, 66),
}