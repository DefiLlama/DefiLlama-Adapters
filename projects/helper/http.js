const axios = require("axios")
const { request, GraphQLClient, } = require("graphql-request")
const sdk = require('@defillama/sdk')
const { getEnv } = require('./env')

const getCacheData = {}

async function getCache(endpoint) {
  if (!getCacheData[endpoint]) getCacheData[endpoint] = get(endpoint)
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
  const tonApiKey = getEnv('TON_API_KEY')
  try {
    if (tonApiKey && endpoint.includes('tonapi.io')) {
      if (!options.headers) options.headers = {}
      options.headers['Authorization'] = tonApiKey
    }
    const data = (await axios.get(endpoint, options)).data
    return data
  } catch (e) {
    sdk.log(e.message)
    throw new Error(`Failed to get ${endpoint}`)
  }
}

async function getWithMetadata(endpoint) {
  return axios.get(endpoint)
}

async function post(endpoint, body, options) {
  try {
    const data = (await axios.post(endpoint, body, options)).data
    return data
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
    const results = await graphQLClient.request(query, { block })
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
    return graphQLClient.request(query, { block: indexedBlockNumber })
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
}
