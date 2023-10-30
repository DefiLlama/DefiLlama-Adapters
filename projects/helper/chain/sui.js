
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const { transformDexBalances } = require('../portedTokens')
const { sliceIntoChunks } = require('../utils')

//https://docs.sui.io/sui-jsonrpc

const endpoint = () => getEnv('SUI_RPC')

async function getObject(objectId) {
  return (await call('sui_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function queryEvents({ eventType, transform = i => i }) {
  let filter = {}
  if (eventType) filter.MoveEventType = eventType 
  const items = []
  let cursor = null
  do {
    const { data , nextCursor, hasNextPage } = await call('suix_queryEvents', [filter, cursor], { withMetadata: true, })
     cursor = hasNextPage ? nextCursor : null
     items.push(...data)
  } while (cursor)
  return items.map(i => i.parsedJson).map(transform)
}

async function getObjects(objectIds) {
  if (objectIds.length > 49) {
    const chunks = sliceIntoChunks(objectIds, 49)
    const res = []
    for (const chunk of chunks) res.push(...(await getObjects(chunk)))
    return res
  }
  const {
    result
  } = await http.post(endpoint(), {
    jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
      "showType": true,
      "showOwner": true,
      "showContent": true,
    }],
  })
  return objectIds.map(i => result.find(j => j.data.objectId === i)?.data?.content)
}

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  return (await call('suix_getDynamicFieldObject', [parent, {
    "type": idType,
    "value": id
  }])).content
}

async function getDynamicFieldObjects({ parent, cursor = null, limit = 48, items = [], idFilter = i => i, addedIds = new Set() }) {
  const {
    result: { data, hasNextPage, nextCursor }
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method: 'suix_getDynamicFields', params: [parent, cursor, limit], })
  sdk.log('[sui] fetched items length', data.length, hasNextPage, nextCursor)
  const fetchIds = data.filter(idFilter).map(i => i.objectId).filter(i => !addedIds.has(i))
  fetchIds.forEach(i => addedIds.add(i))
  const objects = await getObjects(fetchIds)
  items.push(...objects)
  if (!hasNextPage) return items
  return getDynamicFieldObjects({ parent, cursor: nextCursor, items, limit, idFilter, addedIds })
}

async function call(method, params,  { withMetadata = false} = {}) {
  if (!Array.isArray(params)) params = [params]
  const {
    result
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params, })
  return withMetadata ? result : result.data
}

async function multiCall(calls) {
  return Promise.all(calls.map(i => call(...i)))
}


function dexExport({
  account,
  poolStr,
  token0Reserve = i => i.fields.coin_x_reserve,
  token1Reserve = i => i.fields.coin_y_reserve,
  getTokens = i => i.type.split('<')[1].replace('>', '').split(', '),
  isAMM = true,
  eventType,
  eventTransform,
}) {
  return {
    timetravel: false,
    misrepresentedTokens: true,
    sui: {
      tvl: async (_, _1, _2, { api }) => {
        const data = []
        let pools
        if (!eventType) {
          pools = await getDynamicFieldObjects({ parent: account, idFilter: i => poolStr ? i.objectType.includes(poolStr) : i })
        } else {
          pools = await queryEvents({ eventType, transform: eventTransform })
          pools = await getObjects(pools)
        }
        sdk.log(`[sui] Number of pools: ${pools.length}`)
        pools.forEach(i => {
          const [token0, token1] = getTokens(i)
          if (isAMM) {
            data.push({
              token0,
              token1,
              token0Bal: token0Reserve(i),
              token1Bal: token1Reserve(i),
            })
          } else {
            api.add(token0, token0Reserve(i))
            api.add(token1, token1Reserve(i))
          }
        })

        if (!isAMM) return api.getBalances()

        return transformDexBalances({ chain: 'sui', data })
      }
    }
  }
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
  dexExport,
};
