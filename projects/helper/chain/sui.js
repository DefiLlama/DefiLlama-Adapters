const ADDRESSES = require('../coreAssets.json')
// Sui GraphQL / BCS plumbing lives in @defillama/sdk (`sdk.chains.sui`); this file keeps the historical
// export names and shapes plus the TVL helpers (dexExport, sumTokens).
const sdk = require('@defillama/sdk')
const { transformDexBalances } = require('../portedTokens')
const { getUniqueAddresses } = require('../utils')

const sui = sdk.chains.sui

const DUMMY_SENDER = sui.DUMMY_SENDER

// ---------- codec (pure) ----------

const hexToBytes = (hex) => sui.hexToBytes(hex)
const textToBytes = (value) => sui.textToBytes(value)
const toU64 = (value) => sui.toU64(value)
const toU128 = (value) => sui.toU128(value)
const fromU64 = (data, offset = 0) => sui.fromU64(data, offset)
const fromU128 = (data, offset = 0) => sui.fromU128(data, offset)
const parseStructTag = (type) => sui.parseStructTag(type)
const typeTagToBytes = (type) => sui.typeTagToBytes(type)
const buildProgrammableMoveCallBytes = (params) => sui.buildProgrammableMoveCallBytes(params)

async function devInspectTransactionBlock(txBlockBytes, { sender = DUMMY_SENDER } = {}) {
  return sui.devInspectTransactionBlock({ chain: 'sui', txBytes: txBlockBytes, sender })
}

async function getInitialSharedVersion(objectId) {
  return sui.getInitialSharedVersion({ chain: 'sui', objectId })
}

// ---------- objects ----------

async function getObject(objectId) {
  return sui.getObject({ chain: 'sui', objectId })
}

async function getObjects(objectIds, { sleep, skipLayout = false } = {}) {
  return sui.getObjects({ chain: 'sui', objectIds, skipLayout, sleep, concurrency: 20 })
}

async function getObjectsByType(type, { transform } = {}) {
  return sui.getObjectsByType({ chain: 'sui', type, transform })
}

// raw event payloads (`contents.json`), no layout based reshaping
async function queryEvents({ eventType, transform = i => i }) {
  return sui.queryEvents({ chain: 'sui', eventType, skipLayout: true, transform })
}

// ---------- dynamic fields ----------
// the sdk returns the `0x2::dynamic_field::Field<K, V>` wrapper for plain values (callers read `i.fields.value`)
// and the child object for dynamic object fields, the shape this helper always had

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  return sui.getDynamicFieldObject({ chain: 'sui', parent, id, idType })
}

/**
 * All dynamic fields of `parent`. `limit` is the page size (max 50), as it always was in this helper.
 * `items` / `addedIds` can be passed to accumulate across calls; with `onPage` items are handed over per page
 * instead of being returned. `skipLayout` drops the layout blob (~3.5x the json payload); only safe when the
 * caller reads plain fields, since Option/TypeName/UID/ID/String rewrapping needs the layout.
 */
async function getDynamicFieldObjects({ parent, cursor = null, limit = 48, items = [], idFilter = i => i, addedIds = new Set(), sleep, skipLayout = false, onPage }) {
  const filter = (i) => !addedIds.has(i.objectId) && idFilter(i)
  const res = await sui.getDynamicFieldObjects({ chain: 'sui', parent, cursor, pageSize: limit, idFilter: filter, skipLayout, sleep, onPage })
  res.forEach(i => {
    addedIds.add(i.id)
    items.push(i)
  })
  return items
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
      tvl: async (api) => {
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


// GraphQL returns coin types with the address part zero-padded to 64 hex chars
// (e.g. 0x000...002::sui::SUI), while configs commonly use the short form (0x2::sui::SUI).
const normalizeCoinType = (coinType) => sui.normalizeCoinType(coinType)

async function sumTokens({ owners = [], blacklistedTokens = [], api, tokens = [], }) {
  owners = getUniqueAddresses(owners, true)
  const blacklistSet = new Set(blacklistedTokens.map(normalizeCoinType))
  const tokenSet = new Set(tokens.map(normalizeCoinType))

  for (const owner of owners) {
    const balances = await sui.getAllBalances({ chain: 'sui', owner })
    balances.forEach(n => {
      const coinType = normalizeCoinType(n.coinType)
      if (blacklistSet.has(coinType)) return
      if (tokenSet.size > 0 && !tokenSet.has(coinType)) return
      api.add(coinType, n.totalBalance)
    })
  }
  return api.getBalances()
}

function sumTokensExport(config) {
  return (api) => sumTokens({ ...config, api })
}


async function getTokenSupply(token) {
  return sui.getTokenSupply({ chain: 'sui', coinType: token })
}

module.exports = {
  getObject,
  getObjects,
  getObjectsByType,
  queryEvents,
  getDynamicFieldObject,
  getDynamicFieldObjects,
  dexExport,
  sumTokens,
  sumTokensExport,
  queryEventsByType: queryEvents,
  getTokenSupply,
  DUMMY_SENDER,
  buildProgrammableMoveCallBytes,
  devInspectTransactionBlock,
  getInitialSharedVersion,
  parseStructTag,
  typeTagToBytes,
  hexToBytes,
  textToBytes,
  toU64,
  toU128,
  fromU64,
  fromU128,
};
