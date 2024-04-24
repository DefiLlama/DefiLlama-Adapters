
const { getCache, setCache, } = require('../cache');
const sdk = require('@defillama/sdk')
const ethers = require("ethers")

const cacheFolder = 'logs'

async function getLogs({ target,
  topic, keys = [], fromBlock, toBlock, topics,
  api, eventAbi, onlyArgs = false, extraKey, skipCache = false, onlyUseExistingCache = false, customCacheFunction, skipCacheRead = false }) {
  if (!api) throw new Error('Missing sdk api object!')
  if (!target) throw new Error('Missing target!')
  if (!fromBlock) throw new Error('Missing fromBlock!')
  if (onlyUseExistingCache)
    toBlock = 1e11
  else
    await api.getBlock()
  const block = api.block
  const chain = api.chain ?? 'ethereum'
  if (!toBlock) toBlock = block
  if (!toBlock) throw new Error('Missing fromBlock!')

  let iface

  if (eventAbi) {
    iface = new ethers.Interface([eventAbi])
    if (!topics?.length) {
      const fragment = iface.fragments[0]
      topics = undefined
      topic = `${fragment.name}(${fragment.inputs.map(i => i.type).join(',')})`
    }
  }

  target = target.toLowerCase()
  const key = extraKey ? `${chain}/${target}-${extraKey}` : `${chain}/${target}`

  let cache = await _getCache(key)
  let response
  const fetchNewData = (cache.fromBlock && (cache.toBlock + 200) > toBlock) || onlyUseExistingCache

  // if no new data nees to be fetched if the last fetched block is within 200 blocks of the current block
  if (!customCacheFunction && fetchNewData)
    response = cache.logs.filter(i => i.blockNumber < toBlock && i.blockNumber >= fromBlock)
  else
    response = await fetchLogs()

  if (!eventAbi) return response
  if (customCacheFunction) return cache.logs

  return response.map((log) => {
    const res = iface.parseLog(log)
    if (onlyArgs) return res.args
    res.topics = log.topics.map(i => `0x${i.slice(26)}`)
    res.blockNumber = log.blockNumber
    return res
  })

  async function fetchLogs() {
    cache.fromBlock = fromBlock
    fromBlock = cache.toBlock ?? fromBlock

    let logs = (await sdk.api.util.getLogs({
      chain, target, topic, keys, topics, fromBlock, toBlock,
    })).output

    if (!customCacheFunction)
      cache.logs.push(...logs)
    else {
      logs = logs.map(i => iface.parseLog(i))
      if (onlyArgs) logs = logs.map(i => i.args)
      customCacheFunction({ cache, logs })
    }
    cache.toBlock = toBlock

    const logIndices = new Set()

    // remove possible duplicates
    if (!customCacheFunction)
      cache.logs = cache.logs.filter(i => {
        let key = i.transactionHash + (i.logIndex ?? i.index)
        if (!(i.hasOwnProperty('logIndex') || i.hasOwnProperty('index')) || !i.hasOwnProperty('transactionHash')) {
          sdk.log(i, i.logIndex, i.index, i.transactionHash)
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

    if (skipCache || skipCacheRead) return defaultRes

    let cache = await getCache(cacheFolder, key, { checkIfRecent: true })
    // set initial structure if it is missing / reset if from block is moved to something older
    if (!cache.logs || fromBlock < cache.fromBlock) {
      return defaultRes
    }

    return cache
  }
}

async function getLogs2({ factory, target, topic, keys = [], fromBlock, toBlock, topics, api, eventAbi, onlyArgs = true, extraKey, skipCache = false, onlyUseExistingCache = false, customCacheFunction, skipCacheRead = false, transform = i => i }) {
  const res = await getLogs({ target: target ?? factory, topic, keys, fromBlock, toBlock, topics, api, eventAbi, onlyArgs, extraKey, skipCache, onlyUseExistingCache, customCacheFunction, skipCacheRead })
  return res.map(transform)
}

module.exports = {
  getLogs,
  getLogs2,
  getAddress: s => "0x" + s.slice(26, 66),
}