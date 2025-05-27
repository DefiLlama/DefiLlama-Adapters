
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const { transformDexBalances } = require('../portedTokens')
const { sliceIntoChunks, getUniqueAddresses } = require('../utils')

const endpoint = () => getEnv('IOTA_RPC')

async function getObject(objectId) {
  return (await call('iota_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function fnSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function queryEvents({ eventType, transform = i => i }) {
  let filter = {}
  if (eventType) filter.MoveEventType = eventType
  const items = []
  let cursor = null
  do {
    const { data, nextCursor, hasNextPage } = await call('iotax_queryEvents', [filter, cursor], { withMetadata: true, })
    cursor = hasNextPage ? nextCursor : null
    items.push(...data)
  } while (cursor)
  return items.map(i => i.parsedJson).map(transform)
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

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  return (await call('iotax_getDynamicFieldObject', [parent, {
    "type": idType,
    "value": id
  }])).content
}

async function getDynamicFieldObjects({ parent, cursor = null, limit = 48, items = [], idFilter = i => i, addedIds = new Set(), sleep }) {
  if (sleep) await fnSleep(sleep)
  const {
    result: { data, hasNextPage, nextCursor }
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method: 'iotax_getDynamicFields', params: [parent, cursor, limit], })
  sdk.log('[iota] fetched items length', data.length, hasNextPage, nextCursor)
  const fetchIds = data.filter(idFilter).map(i => i.objectId).filter(i => !addedIds.has(i))
  fetchIds.forEach(i => addedIds.add(i))
  const objects = await getObjects(fetchIds)
  items.push(...objects)
  if (!hasNextPage) return items
  return getDynamicFieldObjects({ parent, cursor: nextCursor, items, limit, idFilter, addedIds, sleep })
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

async function multiCall(calls) {
  return Promise.all(calls.map(i => call(...i)))
}

async function sumTokens({ owners = [], blacklistedTokens = [], api, tokens = [], }) {
  owners = getUniqueAddresses(owners, true)
  const bals = await call('iotax_getAllBalances', owners)
  const blacklistSet = new Set(blacklistedTokens)
  const tokenSet = new Set(tokens)
  bals.forEach(i => {
    if (blacklistSet.has(i.coinType)) return;
    if (tokenSet.size > 0 && !tokenSet.has(i.coinType)) return;
    api.add(i.coinType, i.totalBalance)
  })
  return api.getBalances()
}

function sumTokensExport(config) {
  return (api) => sumTokens({ ...config, api })
}


module.exports = {
  endpoint: endpoint(),
  call,
  multiCall,
  getObject,
  getObjects,
  queryEvents,
  getDynamicFieldObject,
  getDynamicFieldObjects,
  sumTokens,
  sumTokensExport,
};
