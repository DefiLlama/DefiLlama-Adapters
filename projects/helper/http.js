const axios = require("axios")
const { request, GraphQLClient, } = require("graphql-request")
const sdk = require('@defillama/sdk')
const { getEnv } = require('./env')

const getCacheData = {}

const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_RETRIES = 3
const DEFAULT_RETRY_DELAY_MS = 500

function _isRetryableError(e) {
  const status = e?.response?.status
  if (status === 429) return true
  if (status >= 500 && status < 600) return true
  if (status) return false // other 4xx are not retryable
  // No response → network/timeout/DNS/abort errors
  return true
}

// Parse a Retry-After header value (RFC 7231): either delta-seconds or an HTTP-date.
// Returns delay in ms, or null if the header is absent/unparseable. Caps at 60s to avoid
// pathological waits from misbehaving servers.
function _parseRetryAfter(e) {
  const header = e?.response?.headers?.['retry-after'] ?? e?.response?.headers?.['Retry-After']
  if (header == null) return null
  const seconds = Number(header)
  let ms
  if (Number.isFinite(seconds)) ms = seconds * 1000
  else {
    const ts = Date.parse(header)
    if (Number.isNaN(ts)) return null
    ms = ts - Date.now()
  }
  if (ms <= 0) return 0
  return Math.min(ms, 60_000)
}

async function withRetry(fn, { retries = DEFAULT_RETRIES, retryDelay = DEFAULT_RETRY_DELAY_MS } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (attempt === retries || !_isRetryableError(e)) break
      const hinted = _parseRetryAfter(e)
      const backoff = retryDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 250)
      const delay = hinted != null ? hinted : backoff
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

async function getCache(endpoint) {
  if (!getCacheData[endpoint]) {
    const promise = get(endpoint)
    // Don't memoize a rejection forever — a single transient failure would otherwise poison
    // every subsequent caller in this process. Drop the entry on failure so the next call retries.
    promise.catch(() => { if (getCacheData[endpoint] === promise) delete getCacheData[endpoint] })
    getCacheData[endpoint] = promise
  }
  return getCacheData[endpoint]
}

async function getBlock(timestamp, chain, chainBlocks, undefinedOk = false) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  if (chainBlocks[chain] || (!getEnv('HISTORICAL') && undefinedOk)) {
    return chainBlocks[chain]
  } else {
    if (chain === "celo") {
      return Number((await get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before")).result.blockNumber);
    } else if (chain === "moonriver") {
      return Number((await get(`https://blockscout.moonriver.moonbeam.network/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`)).result.blockNumber);
    }
    return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
  }
}

async function get(endpoint, options = {}) {
  const { retries, retryDelay, timeout = DEFAULT_TIMEOUT_MS, ...axiosOpts } = options
  const tonApiKey = getEnv('TON_API_KEY')
  if (tonApiKey && endpoint.includes('tonapi.io')) {
    if (!axiosOpts.headers) axiosOpts.headers = {}
    axiosOpts.headers['Authorization'] = tonApiKey
  }
  try {
    return await withRetry(
      async () => (await axios.get(endpoint, { timeout, ...axiosOpts })).data,
      { retries, retryDelay }
    )
  } catch (e) {
    sdk.log(e.message)
    throw new Error(`Failed to get ${endpoint}`)
  }
}

async function getWithMetadata(endpoint, options = {}) {
  const { retries, retryDelay, timeout = DEFAULT_TIMEOUT_MS, ...axiosOpts } = options
  return withRetry(
    () => axios.get(endpoint, { timeout, ...axiosOpts }),
    { retries, retryDelay }
  )
}

async function post(endpoint, body, options = {}) {
  const { retries, retryDelay, timeout = DEFAULT_TIMEOUT_MS, ...axiosOpts } = options
  try {
    return await withRetry(
      async () => (await axios.post(endpoint, body, { timeout, ...axiosOpts })).data,
      { retries, retryDelay }
    )
  } catch (e) {
    sdk.log(e.message)
    throw new Error(`Failed to post ${endpoint}`)
  }
}

async function graphQuery(endpoint, graphQuery, params = {}, { api, timestamp, chain, chainBlocks, useBlock = false } = {}) {

  endpoint = sdk.graph.modifyEndpoint(endpoint)
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  if (api) {
    if (!timestamp) timestamp = api.timestamp
    if (!chain) chain = api.chain
    if (useBlock && !params.block)
      params.block = (await api.getBlock()) - 200

  }
  if (useBlock && !params.block)
    params.block = await getBlock(timestamp, chain, chainBlocks)
  return request(endpoint, graphQuery, params)
}

function extractIndexedBlockNumberFromError(errorString) {
  const patterns = [
    /Failed to decode.*block\.number.*has only indexed up to block number (\d+)/,
    /missing block: \d+, latest: (\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = errorString.match(pattern);
    if (match) return +match[1];
  }
  
  return null;
}

async function blockQuery(endpoint, query, { api, blockCatchupLimit = 500, }) {
  endpoint = sdk.graph.modifyEndpoint(endpoint)
  const graphQLClient = new GraphQLClient(endpoint)
  await api.getBlock()
  const block = api.block
  try {
    const results = await withRetry(() => graphQLClient.request(query, { block }))
    return results
  } catch (e) {
    e.chain = api.chain
    if (!block) throw e
    const errorString = e.toString()
    const indexedBlockNumber = extractIndexedBlockNumberFromError(errorString);
    if (!indexedBlockNumber) throw e;
    sdk.log('Block catchup detected: subgraph indexed up to', indexedBlockNumber, 'but requested block was', block, 'falling back to indexed block')
    if (block - blockCatchupLimit > indexedBlockNumber)
      throw e
    return withRetry(() => graphQLClient.request(query, { block: indexedBlockNumber }))
  }
}


async function proxiedFetch(url) {
  const authInfo = getEnv('PROXY_AUTH')
  if (!authInfo) return get(url)

  const [host, username, password] = authInfo.split(':')

  const client = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  const { data } = await client
    .get(url.toString(), {
      proxy: {
        protocol: "https",
        host,
        port: 8000,
        auth: { username, password },
      },
    })
  return data
}

module.exports = {
  get,
  getCache,
  post,
  blockQuery,
  graphQuery,
  getBlock,
  getWithMetadata,
  proxiedFetch,
  withRetry,
}
