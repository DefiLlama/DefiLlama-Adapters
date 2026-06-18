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

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))

const STARKNET_RPC = getEnv('STARKNET_RPC')

// On-chain Multicall aggregator. Collapses N starknet_call executions into a
// single one (the node executes all sub-calls in one call frame), which is the
// real cost win when the RPC bills per sub-call rather than per HTTP request.
// aggregate(calls: Array<Call>) -> (block_number: u64, results: Array<Span<felt252>>)
// NOTE: aggregate reverts atomically — if any sub-call reverts, the whole call
// reverts — so callers fall back to per-call batching to preserve permitFailure.
const MULTICALL_AGGREGATOR = getEnv('STARKNET_MULTICALL')
const AGGREGATE_CHUNK_SIZE = 50

function formCallBody({ abi, target, params = [], allAbi = [] }, id = 0) {
  if ((params || params === 0) && !Array.isArray(params))
    params = [params]
  const contract = new Contract([abi, ...allAbi,], target, null)
  const requestData = contract.populate(abi.name, params)
  requestData.entry_point_selector = hash.getSelectorFromName(requestData.entrypoint)
  requestData.contract_address = requestData.contractAddress
  delete requestData.contractAddress
  delete requestData.entrypoint
  if (abi.customInput === 'address') requestData.calldata = params
  // Starknet RPC now (2026-06-11) rejects calldata felts without a 0x prefix.
  // `populate` emits decimal strings (e.g. "0"), so normalize every felt to hex.
  requestData.calldata = requestData.calldata.map(i => number.toHex(i))
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
  const { data } = await axios.post(STARKNET_RPC, formCallBody({ abi, target, params, allAbi }))
  return parseOutput(data.result, abi, allAbi, { permitFailure, responseObj: data })
}

async function multiCall({ abi: rootAbi, target: rootTarget, calls = [], allAbi = [], permitFailure = false, useAggregator = true }) {
  if (!calls.length) return []
  calls = calls.map((callArgs) => {
    if (typeof callArgs !== 'object') {
      if (!rootTarget) return { target: callArgs, abi: rootAbi, allAbi, }
      return { target: rootTarget, params: callArgs, abi: rootAbi, allAbi, }
    }
    const { target, params, abi } = callArgs
    return { target: target || rootTarget, params, abi: abi || rootAbi }
  })

  if (useAggregator) {
    try {
      return await aggregateMultiCall({ calls, rootAbi, allAbi })
    } catch (e) {
      // aggregate reverts atomically (one bad sub-call fails the whole batch).
      // Fall back to per-call JSON-RPC batching so permitFailure still works.
    }
  }

  return await batchedMultiCall({ calls, rootAbi, allAbi, permitFailure })
}

// One starknet_call to the on-chain aggregator covering all sub-calls.
async function aggregateMultiCall({ calls, rootAbi, allAbi }) {
  const response = []
  const chunks = sliceIntoChunks(calls, AGGREGATE_CHUNK_SIZE)
  let offset = 0
  for (const chunk of chunks) {
    await sleep(200)
    // Build the Call[] calldata: [n, (to, selector, calldata_len, ...calldata) x n]
    const aggCalldata = [number.toHex(chunk.length)]
    chunk.forEach((c) => {
      const body = formCallBody(c).params[0]
      aggCalldata.push(body.contract_address)
      aggCalldata.push(body.entry_point_selector)
      aggCalldata.push(number.toHex(body.calldata.length))
      body.calldata.forEach((d) => aggCalldata.push(d))
    })
    const aggSelector = hash.getSelectorFromName('aggregate')
    const reqBody = {
      jsonrpc: '2.0', id: 0, method: 'starknet_call',
      params: [{ contract_address: MULTICALL_AGGREGATOR, entry_point_selector: aggSelector, calldata: aggCalldata }, 'latest'],
    }
    const { data } = await axios.post(STARKNET_RPC, reqBody)
    if (!data.result) throw new Error(data.error?.data?.revert_error ?? data.error?.message ?? 'aggregate failed')
    // result layout: [block_number, results_len, (span_len, ...span_felts) x results_len]
    const result = data.result
    let i = 1 // skip block_number
    const resultsLen = +number.toBigInt(result[i++]).toString()
    for (let j = 0; j < resultsLen; j++) {
      const spanLen = +number.toBigInt(result[i++]).toString()
      const span = result.slice(i, i + spanLen)
      i += spanLen
      const abi = chunk[j].abi ?? rootAbi
      response[offset + j] = parseOutput(span, abi, allAbi, {})
    }
    offset += chunk.length
  }
  return response
}

// Original path: N individual starknet_call requests packed into HTTP batches.
async function batchedMultiCall({ calls, rootAbi, allAbi, permitFailure }) {
  const callBodies = calls.map(formCallBody)
  const allData = []
  const chunks = sliceIntoChunks(callBodies, 25)
  for (const chunk of chunks) {
    await sleep(200)
    const { data } = await axios.post(STARKNET_RPC, chunk)
    // Some Starknet RPC providers (e.g. lava.build) return a single object
    // instead of a one-element array when the batch contains exactly one
    // request. Normalize so the spread below never gets a non-iterable.
    const responses = Array.isArray(data) ? data : [data]
    allData.push(...responses)
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
  const { data: { result: to_block } } = await axios.post(STARKNET_RPC, { "id": 1, "jsonrpc": "2.0", "method": "starknet_blockNumber" })
  const params = {
    filter: {
      from_block: fromBlock,
      to_block,
      keys: [topic],
      "address": target,
    }
  }

  const body = { jsonrpc: "2.0", id: 1, method: "starknet_getEvents", params }
  const { data } = await axios.post(STARKNET_RPC, body)
}

api.call = module.exports.call
api.multiCall = module.exports.multiCall
