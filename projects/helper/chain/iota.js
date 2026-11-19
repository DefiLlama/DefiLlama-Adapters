
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const { sliceIntoChunks } = require('../utils')


const endpoint = () => getEnv('IOTA_RPC')

async function getObject(objectId) {
  return (await call('iota_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function getObjects(objectIds) {
  if (objectIds.length > 9) {
    const chunks = sliceIntoChunks(objectIds, 9)
    const res = []
    for (const chunk of chunks) res.push(...(await getObjects(chunk)))
    return res
  }
  const {
    result
  } = await http.post(endpoint(), {
    jsonrpc: "2.0", id: 1, method: 'iota_multiGetObjects', params: [objectIds, {
      "showType": true,
      "showOwner": true,
      "showContent": true,
    }],
  })
  return objectIds.map(i => result.find(j => j.data?.objectId === i)?.data?.content)
}

async function call(method, params, { withMetadata = false } = {}) {
  if (!Array.isArray(params)) params = [params]
  const {
    result, error
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params, })
  if (!result && error) throw new Error(`[iota] ${error.message}`)
  if (['iotax_getAllBalances'].includes(method)) return result
  return withMetadata ? result : result.data
}

// every coin balance (native IOTA included, as 0x2::iota::IOTA) held by the owners
async function sumTokens({ balances = {}, owners = [], blacklistedTokens = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners) {
    const coins = await call('iotax_getAllBalances', [owner])
    for (const { coinType, totalBalance } of coins) {
      if (blacklistedTokens.includes(coinType)) continue
      sdk.util.sumSingleBalance(balances, coinType, totalBalance, 'iota')
    }
  }
  return balances
}

module.exports = {
  endpoint: endpoint(),
  call,
  getObject,
  getObjects,
  sumTokens,
};
