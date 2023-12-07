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

async function graphQuery(endpoint, graphQuery, params = {}, { api, timestamp, chain, chainBlocks, useBlock = false } = {}) {
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


module.exports = {
  get,
  getCache,
  post,
  blockQuery,
  graphQuery,
  getBlock,
  getWithMetadata,
}
