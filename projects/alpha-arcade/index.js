const axios = require('axios')
const { PromisePool } = require('@supercharge/promise-pool')
const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");

// Market discovery mirrors the official SDK (https://github.com/phara23/alpha-sdk, src/modules/markets.ts):
// every market is an application created by the Alpha Arcade market creator address.
const MARKET_CREATOR = '5P5Y6HTWUNG2E3VXBQDZN3ENZD3JPAIR5PKT3LOYJAPAUKOLFD6KANYTRY'
const USDC = '31566704'

// own client: ~4.5k markets need one indexer call each, the shared 10 req/s limited helper would take ~10 min
const indexer = axios.create({ baseURL: 'https://mainnet-idx.algonode.cloud', timeout: 300000 })
const rethrow = (err) => { throw err }
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

  // Open orders: escrow apps created by the market app hold USDC (buy orders) or YES/NO tokens (sell orders)
  const escrows = []
  await PromisePool.withConcurrency(5).for(markets).handleError(rethrow).process(async (m) => {
    escrows.push(...await getCreatedApps(getApplicationAddress(m.id)))
  })

  await PromisePool.withConcurrency(5).for(escrows).handleError(rethrow).process(async (e) => {
    const { account } = await get(`/v2/accounts/${getApplicationAddress(e.id)}`)
    for (const asset of account.assets ?? []) {
      if (!asset.amount) continue
      if (String(asset['asset-id']) === USDC) api.add(USDC, asset.amount)
      else api.add(USDC, Math.floor(asset.amount * (e.price ?? 0) / 1e6)) // YES/NO tokens valued at the order's limit price
    }
  })
}

module.exports = {
  methodology: 'TVL is the USDC locked across all unresolved markets: collateral backing matched YES/NO positions held by the market contracts, plus open orders held in escrow contracts (buy orders as USDC, sell orders as outcome tokens valued at their limit price).',
  timetravel: false,
  algorand: { tvl },
};
