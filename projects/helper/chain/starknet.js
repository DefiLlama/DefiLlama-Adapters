// https://www.starknetjs.com/docs/API/contract
// https://playground.open-rpc.org/?uiSchema%5BappBar%5D%5Bui:splitView%5D=false&schemaUrl=https://raw.githubusercontent.com/starkware-libs/starknet-specs/master/api/starknet_api_openrpc.json&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:darkMode%5D=true&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false
// https://docs.alchemy.com/reference/starknet-getevents
//
// RPC transport, Cairo codec and the aggregator/batched multicall live in @defillama/sdk (`sdk.chains.starknet`,
// rate limited through its own STARKNET limiter); this file keeps the TVL helpers (sumTokens, dexExport) and the
// on-disk event cache on top of it.
const { getUniqueAddresses } = require('../tokenMapping')
const { starknet } = require('@defillama/sdk').chains
const abi = require('../../10kswap/abi')
const { getUniTVL } = require('../cache/uniswap')
const { getCache, setCache } = require('../cache')
const ADDRESSES = require('../coreAssets.json')

const { validateAndParseAddress, number } = starknet

async function call({ abi, target, params = [], allAbi = [], permitFailure = false } = {}) {
  return starknet.call({ abi, target, params, allAbi, permitFailure })
}

async function multiCall({ abi, target, calls = [], allAbi = [], permitFailure = false, useAggregator = true }) {
  return starknet.multiCall({ abi, target, calls, allAbi, permitFailure, useAggregator })
}

const balanceOfABI = {
  "name": "balanceOf",
  "type": "function",
  "inputs": [
    {
      "name": "account",
      "type": "felt"
    }
  ],
  "outputs": [
    {
      "name": "balance",
      "type": "Uint256"
    }
  ],
  "stateMutability": "view",
  "customInput": 'address',
}

function replaceNull(i) {
  return i === ADDRESSES.null ? ADDRESSES.starknet.ETH : i
}

async function sumTokens({ owner, owners = [], tokens = [], tokensAndOwners = [], blacklistedTokens = [], token, ownerTokens = [], api, }) {

  tokens = tokens.map(replaceNull)
  tokensAndOwners = tokensAndOwners.map(i => [replaceNull(i[0]), i[1]])
  if (token) tokens = [token]
  if (owner) owners = [owner]

  owners = getUniqueAddresses(owners, 'starknet')
  blacklistedTokens = getUniqueAddresses(blacklistedTokens, 'starknet')

  if (!tokensAndOwners.length) {
    if (!owners.length && owner)
      owners = [owner]

    tokensAndOwners = tokens.map(t => owners.map(o => ([t, o]))).flat()
  }
  if (ownerTokens.length) {
    ownerTokens.forEach(([tokens, o]) => tokens.forEach(t => tokensAndOwners.push([t, o])))
  }

  tokensAndOwners = getUniqueToA(tokensAndOwners, 'starknet')
  tokensAndOwners = tokensAndOwners.filter(i => !blacklistedTokens.includes(i[0]))
  const res = await multiCall({ abi: balanceOfABI, calls: tokensAndOwners.map(i => ({ target: i[0], params: i[1] })) })
  res.forEach((v, i) => api.add(tokensAndOwners[i][0], +v))
  return api.getBalances()


  function getUniqueToA(toa, chain) {
    toa = toa.map(i => i.join('¤'))
    return getUniqueAddresses(toa, chain).map(i => i.split('¤'))
  }
}

const api = {
  chain: 'starknet',
}

const defaultAbis = {
  allPairsLength: abi.factory.allPairsLength,
  allPairs: abi.factory.allPairs,
  token0: abi.pair.token0,
  token1: abi.pair.token1,
  getReserves: abi.pair.getReserves,
  balanceOf: balanceOfABI,
}

function dexExport({ factory, abis = {}, fetchBalances = false }) {
  return () => getUniTVL({ factory, abis: { ...defaultAbis, ...abis }, fetchBalances })(api, undefined, undefined, { api, })
}

async function rpc(method, params = []) {
  return starknet.rpc(method, params)
}

async function getBlockNumber() {
  return starknet.getBlockNumber()
}

const LOGS_CACHE_FOLDER = 'starknet-logs'

/**
 * Fetch events emitted by a contract via starknet_getEvents, with an incremental cache:
 * blocks that were already scanned are never pulled again, only [cache.toBlock + 1, latest].
 *
 * @param {string}   target      contract address
 * @param {number}   fromBlock   deployment block (scan start on first run)
 * @param {string[]} topics      event selectors (any of them) - shorthand for keys: [topics]
 * @param {string[][]} keys      raw starknet_getEvents keys filter (positional, each an OR list)
 * @param {string}   extraKey    extra cache-key segment (when the same target is queried with different filters)
 * @param {boolean}  skipCache   don't read/write the cache
 * @param {number}   chunkSize   page size for starknet_getEvents (providers cap this, 1000 is widely accepted)
 * @returns raw events: { block_number, transaction_hash, from_address, keys, data }
 */
async function getLogs({ target, fromBlock, topics, keys, extraKey, skipCache = false, chunkSize = 1000 }) {
  if (!target) throw new Error('Missing target!')
  if (!fromBlock) throw new Error('Missing fromBlock!')
  if (!keys && topics) keys = [topics]
  keys = (keys ?? []).map(k => (Array.isArray(k) ? k : [k]).map(i => number.toHex(i)))
  target = target.toLowerCase()

  const keySegment = keys.flat().map(i => i.slice(2, 10)).join('_')
  const cacheKey = [target, keySegment, extraKey].filter(Boolean).join('-')

  let cache = skipCache ? {} : await getCache(LOGS_CACHE_FOLDER, cacheKey)
  if (!cache.logs || cache.fromBlock > fromBlock) cache = { logs: [], fromBlock }

  const toBlock = await getBlockNumber()
  const start = cache.toBlock ? cache.toBlock + 1 : fromBlock
  if (start > toBlock) return cache.logs

  const newLogs = await starknet.getLogs({ target, fromBlock: start, toBlock, keys, chunkSize })
  cache.logs.push(...newLogs)

  // defensive dedupe (Starknet events carry no log index)
  const seen = new Set()
  cache.logs = cache.logs.filter(i => {
    const id = `${i.transaction_hash}|${i.from_address}|${(i.keys ?? []).join(',')}|${(i.data ?? []).join(',')}`
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  cache.toBlock = toBlock

  if (!skipCache) await setCache(LOGS_CACHE_FOLDER, cacheKey, cache)
  return cache.logs
}

module.exports = {
  call,
  multiCall,
  parseAddress: validateAndParseAddress,
  sumTokens,
  number,
  dexExport,
  rpc,
  getBlockNumber,
  getLogs,
}

api.call = module.exports.call
api.multiCall = module.exports.multiCall
