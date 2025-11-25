// https://www.starknetjs.com/docs/API/contract
// https://playground.open-rpc.org/?uiSchema%5BappBar%5D%5Bui:splitView%5D=false&schemaUrl=https://raw.githubusercontent.com/starkware-libs/starknet-specs/master/api/starknet_api_openrpc.json&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:darkMode%5D=true&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false
// https://docs.alchemy.com/reference/starknet-getevents
const { getUniqueAddresses } = require('../tokenMapping')
const { Contract, validateAndParseAddress, number, hash, CallData } = require('starknet')
const abi = require('../../10kswap/abi')
const axios = require('axios')
const plimit = require('p-limit')
const { sliceIntoChunks, sleep } = require('../utils')
const { getUniTVL } = require('../cache/uniswap')
const { getCache } = require('../cache')
const { getEnv } = require('../env')
const ADDRESSES = require('../coreAssets.json')
const { initializeProviders } = require('./starknet-providers')
const { createCircuitBreaker, log } = require('./starknet-circuit')
const { retryWithBackoff } = require('./starknet-retry')

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))

// Initialize providers and circuit breakers (lazy loading)
let providers = null
let circuitBreakers = null

function initializeCircuits() {
  if (!providers) {
    providers = initializeProviders()
    circuitBreakers = providers.map(provider => {
      const requestFn = async (body) => {
        const { data } = await axios.post(provider.getEndpoint(), body)
        return data
      }
      return createCircuitBreaker(provider, requestFn)
    })

    log.info('Starknet RPC providers initialized', {
      providerCount: providers.length,
      providers: providers.map(p => p.name),
    })
  }
  return { providers, circuitBreakers }
}

/**
 * Make RPC call with automatic failover across providers
 *
 * @param {Object|Array} body - RPC request body (single request or batch)
 * @returns {Promise<Object>} RPC response data
 * @throws {Error} If all providers fail
 */
async function makeRpcCall(body) {
  const { circuitBreakers, providers } = initializeCircuits()

  let lastError = null

  // Try each provider in order with retry
  for (let i = 0; i < circuitBreakers.length; i++) {
    const breaker = circuitBreakers[i]
    const provider = providers[i]

    try {
      log.debug('Attempting Starknet RPC call', {
        provider: provider.name,
        attempt: i + 1,
        totalProviders: circuitBreakers.length,
      })

      // Retry with exponential backoff (up to 3 attempts per provider)
      const data = await retryWithBackoff(
        () => breaker.fire(body),
        { provider: provider.name }
      )

      log.debug('Starknet RPC call succeeded', {
        provider: provider.name,
        attempt: i + 1,
      })

      return data

    } catch (error) {
      lastError = error

      log.warn('Starknet RPC provider failed after retries, trying next provider', {
        provider: provider.name,
        attempt: i + 1,
        error: error.message,
        nextProvider: i + 1 < providers.length ? providers[i + 1].name : 'none',
      })

      // Continue to next provider
      continue
    }
  }

  // All providers failed
  log.error('All Starknet RPC providers failed', lastError, {
    providerCount: providers.length,
    providers: providers.map(p => ({ name: p.name, stats: p.getStats() })),
  })

  throw new Error(`All Starknet RPC providers failed. Last error: ${lastError.message}`)
}

function formCallBody({ abi, target, params = [], allAbi = [] }, id = 0) {
  if ((params || params === 0) && !Array.isArray(params))
    params = [params]
  const contract = new Contract([abi, ...allAbi,], target, null)
  const requestData = contract.populate(abi.name, params)
  requestData.entry_point_selector = hash.getSelectorFromName(requestData.entrypoint)
  requestData.contract_address = requestData.contractAddress
  delete requestData.contractAddress
  delete requestData.entrypoint
  if (abi.customInput === 'address') requestData.calldata = params.map(i => i.slice(2))
  return getCallBody(requestData, id)

  function getCallBody(i) {
    return { jsonrpc: "2.0", id, method: "starknet_call", params: [i, "latest"] }
  }
}

function parseOutput(result, abi, allAbi, { permitFailure = false, responseObj = {} } = {}) {
  if (!result) {
    let errorMessage = responseObj.error?.data?.revert_error ?? responseObj.error?.message ?? 'Call failed'
    if (permitFailure) return null
    throw new Error(`Starknet call failed: ${errorMessage}`)
  }

  let response = new CallData([abi, ...allAbi]).parse(abi.name, result)
  // convert BigInt to string
  for (const key in response) {
    if (typeof response[key] === 'bigint') response[key] = response[key].toString()
  }

  if (abi.outputs.length === 1 && !abi.outputs[0].type.includes('::')) {
    response = response[abi.outputs[0].name]
    if (abi.outputs[0].type === 'Uint256') return +response
    switch (abi.customType) {
      case 'address': return validateAndParseAddress(response)
      case 'Uint256': return +response
    }
  }
  return response
}

async function call({ abi, target, params = [], allAbi = [], permitFailure = false } = {}, ...rest) {
  const data = await makeRpcCall(formCallBody({ abi, target, params, allAbi }))
  return parseOutput(data.result, abi, allAbi, { permitFailure, responseObj: data })
}

async function multiCall({ abi: rootAbi, target: rootTarget, calls = [], allAbi = [], permitFailure = false }) {
  if (!calls.length) return []
  calls = calls.map((callArgs) => {
    if (typeof callArgs !== 'object') {
      if (!rootTarget) return { target: callArgs, abi: rootAbi, allAbi, }
      return { target: rootTarget, params: callArgs, abi: rootAbi, allAbi, }
    }
    const { target, params, abi } = callArgs
    return { target: target || rootTarget, params, abi: abi || rootAbi }
  })
  const callBodies = calls.map(formCallBody)
  const allData = []
  const chunks = sliceIntoChunks(callBodies, 25)
  for (const chunk of chunks) {
    await sleep(200)
    const responseData = await makeRpcCall(chunk)
    // For batch requests, axios returns the array directly in data
    const batchResults = Array.isArray(responseData) ? responseData : [responseData]
    allData.push(...batchResults)
  }

  const response = []
  allData.forEach((i) => {
    const { result, id } = i
    const abi = calls[id].abi ?? rootAbi
    response[id] = parseOutput(result, abi, allAbi, { permitFailure, responseObj: i })
  })
  return response
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

module.exports = {
  call: rateLimited(call),
  multiCall: rateLimited(multiCall),
  parseAddress: validateAndParseAddress,
  sumTokens: rateLimited(sumTokens),
  number,
  dexExport,
}

// WIP
async function getLogs({ fromBlock, topic, target }) {
  const cache = await getCache('starknet-logs', topic)
  fromBlock = cache.toBlock || fromBlock
  const blockNumberResponse = await makeRpcCall({ "id": 1, "jsonrpc": "2.0", "method": "starknet_blockNumber" })
  const to_block = blockNumberResponse.result
  const params = {
    filter: {
      from_block: fromBlock,
      to_block,
      keys: [topic],
      "address": target,
    }
  }

  const body = { jsonrpc: "2.0", id: 1, method: "starknet_getEvents", params }
  const data = await makeRpcCall(body)
  return data
}

api.call = module.exports.call
api.multiCall = module.exports.multiCall
