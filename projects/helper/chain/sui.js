
const sdk = require('@defillama/sdk')

const http = require('../http')
const env = require('../env')
const { transformDexBalances } = require('../portedTokens')

//https://docs.sui.io/sui-jsonrpc

const endpoint = env.SUI_RPC || "https://fullnode.mainnet.sui.io/"

async function getObject(objectId) {
  return (await call('sui_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function getObjects(objectIds) {
  const {
    result
  } = await http.post(endpoint, {
    jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
      "showType": true,
      "showOwner": true,
      "showContent": true,
    }],
  })
  return objectIds.map(i => result.find(j => j.data.objectId === i)?.data?.content)
}

async function getDynamicFieldObject(parent, id) {
  return (await call('suix_getDynamicFieldObject', [parent, {
    "type": "0x2::object::ID",
    "value": id
  }])).content
}

async function getDynamicFieldObjects({ parent, cursor = null, limit = 9999, items = [], idFilter = i => i }) {
  const {
    result: { data, hasNextPage, nextCursor }
  } = await http.post(endpoint, { jsonrpc: "2.0", id: 1, method: 'suix_getDynamicFields', params: [parent, cursor, limit], })
  sdk.log('[sui] fetched items length', data.length, hasNextPage, nextCursor)
  items.push(...(await getObjects(data.filter(idFilter).map(i => i.objectId))))
  if (!hasNextPage) return items
  return { parent, cursor: nextCursor, items, limit }
}

async function call(method, params) {
  if (!Array.isArray(params)) params = [params]
  const {
    result: { data }
  } = await http.post(endpoint, { jsonrpc: "2.0", id: 1, method, params, })
  return data
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
}) {
  return {
    timetravel: false,
    misrepresentedTokens: true,
    sui: {
      tvl: async () => {
        const data = []
        let pools = await getDynamicFieldObjects({ parent: account, idFilter: i => i.objectType.includes(poolStr) })
        sdk.log(`[sui] Number of pools: ${pools.length}`)
        pools.forEach(i => {
          const [token0, token1] = getTokens(i)
          data.push({
            token0,
            token1,
            token0Bal: token0Reserve(i),
            token1Bal: token1Reserve(i),
          })
        })

        return transformDexBalances({ chain: 'sui', data })
      }
    }
  }
}

module.exports = {
  endpoint,
  call,
  multiCall,
  getObject,
  getObjects,
  getDynamicFieldObject,
  getDynamicFieldObjects,
  dexExport,
};
