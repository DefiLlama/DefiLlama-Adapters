
const { getCache, setCache, } = require('../cache');
const sdk = require('@defillama/sdk');
const { default: axios } = require('axios');
const ethers = require("ethers")

const cacheFolder = 'logs'

async function getLogs({ target,
  topic, keys = [], fromBlock, toBlock, topics,
  api, eventAbi, onlyArgs = false, extraKey, skipCache = false, onlyUseExistingCache = false, customCacheFunction, skipCacheRead = false, compressType, useIndexer }) {
  if (!api) throw new Error('Missing sdk api object!')
  if (!target) throw new Error('Missing target!')
  if (!fromBlock) throw new Error('Missing fromBlock!')
  if (onlyUseExistingCache)
    toBlock = 1e11
  else
    await api.getBlock()

  if (useIndexer === undefined) useIndexer = indexerChains.has(api.chain)

  const block = api.block
  const chain = api.chain ?? 'ethereum'

  if (chain === 'xlayer') onlyUseExistingCache = true // xlayer rpcs severely limit the number of logs that can be fetched, so we need to use the cache


  if (!toBlock) toBlock = block
  if (!toBlock) throw new Error('Missing toBlock!')

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
  const fetchNewData = (cache.fromBlock && (cache.toBlock + 2) > toBlock) || onlyUseExistingCache

  // if no new data nees to be fetched if the last fetched block is within 2 blocks of the current block
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

    // remove tuple baseType from type
    // ex: CreateMarket(bytes32,tuple(address,address,address,address,uint256)) -> CreateMarket(bytes32,(address,address,address,address,uint256))
    if (eventAbi) {
      if (!topics?.length) {
        const fragment = iface.fragments[0]
        topic = `${fragment.name}(${fragment.inputs.map(i => i.baseType === 'tuple' ? i.type.replace('tuple', '') : i.type).join(',')})`
      }
    }

    let logs

    if (!useIndexer) {

      logs = (await sdk.api.util.getLogs({
        chain, target, topic, keys, topics, fromBlock, toBlock,
      })).output

    } else {
      // if use indexer flag is enabled, we use the new getLogs method that tries to pull from indexer if it is configured, else from chain rpcs

      logs = await sdk.getEventLogs({
        chain, target, topic, keys, topics, fromBlock, toBlock, skipIndexer: !useIndexer, entireLog: true,
      })

    }

    // let logs = await getLogsFromEtherscanAPI({ address: target, fromBlock, toBlock, api, topic0: topic })

    if (!customCacheFunction)
      cache.logs = cache.logs.concat(logs)
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
        let key = (i.transactionHash ?? i.hash) + (i.logIndex ?? i.index)
        if (!(i.hasOwnProperty('logIndex') || i.hasOwnProperty('index')) || !(i.hasOwnProperty('transactionHash') || i.hasOwnProperty('hash'))) {
          sdk.log(i, i.logIndex, i.index, i.transactionHash)
          throw new Error('Missing crucial field')
        }
        if (logIndices.has(key)) return false
        logIndices.add(key)
        return true
      })

    if (!skipCache) {

      const whitelistedFields = ['topics', 'data', 'hash', 'index', 'blockNumber']
      if (compressType === 'v1') {
        cache.logs.forEach(i => {
          i.hash = i.hash ?? i.transactionHash
          i.index = i.index ?? i.logIndex
          Object.keys(i).forEach(key => {
            if (!whitelistedFields.includes(key)) {
              delete i[key]
            }
          })
        })
      }
      await _setCache(cacheFolder, key, cache)
    }

    return cache.logs
  }

  async function _setCache(cacheFolder, key, cache) {
    const chunkSize = 1e5

    // default case if there are less than 100_000 logs
    if (cache.logs.length < chunkSize) return setCache(cacheFolder, key, cache)


    let allLogs = cache.logs
    cache.logs = allLogs.slice(0, chunkSize)
    allLogs = allLogs.slice(chunkSize)
    cache.hasMore = allLogs.length > 0
    await setCache(cacheFolder, key, cache)

    let index = 0

    while (allLogs.length) {
      const logs = allLogs.splice(0, chunkSize)
      allLogs = allLogs.slice(chunkSize)
      const chunkKey = `${key}-${index}`
      const hasMore = allLogs.length > 0
      await setCache(cacheFolder, chunkKey, { logs, hasMore })
      sdk.log(`Saved ${logs.length} logs to cache: ${chunkKey}, has more: ${hasMore}`)
      index++
    }
  }

  async function _getCache(key) {
    const defaultRes = {
      logs: [],
      hasMore: false,
    }

    if (skipCache || skipCacheRead) return defaultRes

    let cache = await getCache(cacheFolder, key, { checkIfRecent: true, })
    let hasMore = cache.hasMore
    let index = 0

    // if there are more than 100_000 logs, we need to fetch them in chunks
    while (hasMore) {
      sdk.log(`Fetching more logs for ${key} from cache: ${index}`)
      const extraLogs = await getCache(cacheFolder, `${key}-${index}`, { checkIfRecent: true, })
      index++
      hasMore = extraLogs.hasMore
      cache.logs = cache.logs.concat(extraLogs.logs)
      sdk.log(cache.logs.length, 'logs fetched from cache', extraLogs.logs.length, 'more logs', extraLogs.hasMore ? 'and more to come' : 'no more logs')
    }


    // set initial structure if it is missing / reset if from block is moved to something older
    if (!cache.logs || fromBlock < cache.fromBlock) {
      return defaultRes
    }

    return cache
  }
}

const indexerChains = new Set(['monad', 'base', 'unichain', 'bsc'])

async function getLogs2({ factory, target, topic, keys = [], fromBlock, toBlock, topics, api, eventAbi, onlyArgs = true, extraKey, skipCache = false, onlyUseExistingCache = false, customCacheFunction, skipCacheRead = false, transform = i => i, compressType, useIndexer, ...rest }) {

  const res = await getLogs({ target: target ?? factory, topic, keys, fromBlock, toBlock, topics, api, eventAbi, onlyArgs, extraKey, skipCache, onlyUseExistingCache, customCacheFunction, skipCacheRead, compressType, useIndexer, ...rest })
  return res.map(transform)
}

module.exports = {
  getLogs,
  getLogs2,
  getAddress: s => "0x" + s.slice(26, 66),
}

async function getLogsFromEtherscanAPI({ address, fromBlock, toBlock, api, topic0 }) {
  if (!topic0.startsWith('0x')) topic0 = ethers.id(topic0)
  const apiKey = process.env.SDK_ETHERSCAN_API_KEY

  const { data } = await axios.get('https://api.etherscan.io/v2/api', {
    params: {
      address,
      fromBlock,
      toBlock,
      topic0,
      chainid: api.chainId,
      module: 'logs',
      action: 'getLogs',
      page: 1,
      offset: 0,
      apikey: apiKey,
    }
  })
  console.log('Etherscan API response:', data.result.length, 'logs fetched')
  return data.result
}