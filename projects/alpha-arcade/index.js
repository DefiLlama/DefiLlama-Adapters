const axios = require('axios')
const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const { getLowValueCache } = require('../helper/cache/lowValue')

// Market discovery mirrors the official SDK (https://github.com/phara23/alpha-sdk, src/modules/markets.ts):
// every market is an application created by the Alpha Arcade market creator address.
const MARKET_CREATOR = '5P5Y6HTWUNG2E3VXBQDZN3ENZD3JPAIR5PKT3LOYJAPAUKOLFD6KANYTRY'
const USDC = '31566704'

const indexer = axios.create({ baseURL: 'https://mainnet-idx.algonode.cloud', timeout: 300000 })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function get(url, params) {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await indexer.get(url, { params })).data
    } catch (e) {
      const status = e.response?.status
      if (attempt >= 5 || (status !== 429 && status < 500)) throw e
      await sleep(1000 * 2 ** attempt)
    }
  }
}

function decodeState(rawState = []) {
  const state = {}
  for (const { key, value } of rawState) {
    const k = Buffer.from(key, 'base64').toString()
    state[k] = value.type === 1 ? Buffer.from(value.bytes, 'base64').toString() : Number(value.uint)
  }
  return state
}

async function getCreatedApps(address) {
  const apps = []
  let next
  do {
    const data = await get(`/v2/accounts/${address}/created-applications`, { limit: 1000, next })
    apps.push(...data.applications)
    next = data['next-token']
  } while (next)
  return apps.filter(a => !a.deleted).map(a => ({ id: a.id, ...decodeState(a.params?.['global-state']) }))
}

async function tvl(api) {
  const markets = (await getCreatedApps(MARKET_CREATOR)).filter(m => m.is_activated && !m.is_resolved)

  // Matched orders: each YES/NO pair is backed 1:1 by USDC held in the market app,
  // so yes_supply (== no_supply while unresolved) is the market's USDC balance. Resolved markets have paid out.
  markets.forEach(m => api.add(USDC, m.yes_supply ?? 0))

  // Open orders: escrow apps created by the market app hold USDC (buy orders) or YES/NO tokens (sell orders).
  // Listing a market's escrows is one indexer call and each escrow is one more, ~6k calls over all markets, while most
  // markets have next to nothing on their books. A market whose open orders are worth under $100 is stored with that
  // amount, counted from the store, and read again once a week.
  const lowValue = await getLowValueCache({ api, project: 'alpha-arcade', key: 'market-open-orders', checkpointEvery: 100 })
  for (const marketId of lowValue.filter(markets.map(m => String(m.id)))) {
    const escrows = await getCreatedApps(getApplicationAddress(Number(marketId)))
    let openOrders = 0
    for (const escrow of escrows) {
      const { account } = await get(`/v2/accounts/${getApplicationAddress(escrow.id)}`, { 'include-all': true })
      if (account.deleted) continue
      for (const asset of account.assets ?? []) {
        if (asset.deleted || !asset.amount) continue
        if (String(asset['asset-id']) === USDC) openOrders += asset.amount
        else openOrders += Math.floor(asset.amount * (escrow.price ?? 0) / 1e6) // YES/NO tokens valued at the order's limit price
      }
    }
    await lowValue.record([[marketId, { [USDC]: openOrders }]])
  }
  await lowValue.save()
}

module.exports = {
  methodology: 'TVL is the USDC locked across all unresolved markets: collateral backing matched YES/NO positions held by the market contracts, plus open orders held in escrow contracts (buy orders as USDC, sell orders as outcome tokens valued at their limit price).',
  timetravel: false,
  algorand: { tvl },
};
