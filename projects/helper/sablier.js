const { request } = require('graphql-request')
const { sleep } = require('./utils')

const ENVIO_ENDPOINT = 'https://indexer.hyperindex.xyz/53b7e25/v1/graphql'
const PAGE_SIZE = 1000

// The indexer allows 250 requests per minute, shared by everyone using it. Each adapter used to send one request per
// chain and per export (50+ per run) and kept running into 429s, so all chains are now read with the same few requests.
async function query(payload, variables) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request(ENVIO_ENDPOINT, payload, variables)
    } catch (e) {
      if (e?.response?.status !== 429 || attempt >= 5) throw e
      // the 429 response says how many seconds are left until the window resets
      const reset = +e.response.headers?.get?.('x-ratelimit-reset')
      await sleep((reset > 0 && reset <= 60 ? reset + 1 : 30) * 1000)
    }
  }
}

async function queryAll(entity, where, fields) {
  const payload = `query getAll($offset: Int!) { ${entity}(where: ${where}, order_by: { id: asc }, limit: ${PAGE_SIZE}, offset: $offset) { ${fields} } }`
  const items = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (await query(payload, { offset }))[entity]
    items.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return items
}

async function fetchEnvioData(category) {
  const contracts = await queryAll('Contract', `{ category: { _eq: "${category}" } }`, 'id address chainId')
  const assets = await queryAll('Asset', `{ ${category}Streams_aggregate: { count: { predicate: { _gt: 0 } } } }`, 'id chainId symbol')
  return { contracts, assets }
}

const cache = {}

// contracts and assets (with at least one stream) of a category ('lockup' | 'flow') on one chain
async function getEnvioChainData(category, chainId) {
  if (!cache[category]) cache[category] = fetchEnvioData(category).catch(e => { delete cache[category]; throw e })
  const { contracts, assets } = await cache[category]
  return {
    contracts: contracts.filter(i => +i.chainId === chainId),
    assets: assets.filter(i => +i.chainId === chainId),
  }
}

module.exports = { getEnvioChainData }
