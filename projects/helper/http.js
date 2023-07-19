const axios = require("axios")
const { request, GraphQLClient, } = require("graphql-request")
const sdk = require('@defillama/sdk')
const { getEnv } = require('./env')
const { getCache: cGetCache, setCache } = require('./cache')

const chainIds = {
  'ethereum': 1,
  'optimism': 10,
  'bsc': 56,
  'polygon': 137,
  'arbitrum': 42161,
  'fantom': 250,
  'avax': 43114,
}

const getCacheData = {}

async function getCache(endpoint) {
  if (!getCacheData[endpoint]) getCacheData[endpoint] = get(endpoint)
  return getCacheData[endpoint]
}

async function getBlock(timestamp, chain, chainBlocks, undefinedOk = false) {
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

async function get(endpoint) {
  return (await axios.get(endpoint)).data
}

async function getWithMetadata(endpoint) {
  return axios.get(endpoint)
}

async function post(endpoint, body) {
  return (await axios.post(endpoint, body)).data
}

async function graphQuery(endpoint, graphQuery, params = {}, { timestamp, chain, chainBlocks, useBlock = false } = {}) {
  if (useBlock && !params.block)
    params.block = await getBlock(timestamp, chain, chainBlocks)
  return request(endpoint, graphQuery, params)
}

async function covalentGetTokens(address, chain = 'ethereum') {
  let chainId = chainIds[chain]
  if (!chainId) throw new Error('Missing chain to chain id mapping:' + chain)
  if (!address) throw new Error('Missing adddress')

  const timeNow = +Date.now()
  const THREE_DAYS = 3 * 24 * 3600 * 1000
  const project = 'covalent-cache'
  const key = `${address}/${chain}`
  const cache = (await cGetCache(project, key)) ?? {}
  if (!cache.timestamp || (cache.timestamp + THREE_DAYS) < timeNow) {
    cache.data = await _covalentGetTokens()
    cache.timestamp = timeNow
    await setCache(project, key, cache)
  }

  return cache.data

  async function _covalentGetTokens() {
    const {
      data: { items }
    } = await get(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=${getEnv('COVALENT_KEY')}`)
    let table = {}
    items
      .filter(i => +i.balance > 0)
      .forEach(i => table[i.contract_name || 'null'] = i.contract_address)
    return items
      .filter(i => +i.balance > 0)
      .map(i => i.contract_address.toLowerCase())
  }
}

async function blockQuery(endpoint, query, { api, blockCatchupLimit = 500, }) {
  const graphQLClient = new GraphQLClient(endpoint)
  await api.getBlock()
  const block = api.block
  try {
    const results = await graphQLClient.request(query, { block })
    return results
  } catch (e) {
    if (!block) throw e
    const errorString = e.toString()
    const isBlockCatchupIssue = /Failed to decode.*block.number.*has only indexed up to block number \d+/.test(errorString)
    if (!isBlockCatchupIssue) throw e
    const indexedBlockNumber = +errorString.match(/indexed up to block number (\d+) /)[1]
    sdk.log('We have indexed only upto ', indexedBlockNumber, 'requested block: ', block)
    if (block - blockCatchupLimit > indexedBlockNumber)
      throw e
    return graphQLClient.request(query, { block: indexedBlockNumber })
  }
}

async function graphFetchById({  endpoint, query, params = {}, api, options: { useBlock = false } = {} }) {
  if (useBlock && !params.block)
    params.block = await api.getBlock() - 100

  let data = []
  let lastId = ""
  let response;
  do {
    const res = await request(endpoint, query, { ...params, lastId })
    Object.keys(res).forEach(key => response = res[key])
    data.push(...response)
    lastId = response[response.length - 1]?.id
    sdk.log(data.length, response.length)
  } while (lastId)
  return data
}

module.exports = {
  get,
  getCache,
  post,
  blockQuery,
  graphQuery,
  covalentGetTokens,
  graphFetchById,
  getBlock,
  getWithMetadata,
}
