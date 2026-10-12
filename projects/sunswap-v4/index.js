const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')
const { sumTokens2 } = require('../helper/unwrapLPs')

// SunSwap V4 uses a singleton PoolManager: all V4 liquidity is held by this one contract.
// TVL = token balances of the PoolManager.
// No SunSwap V4 hook custodies liquidity, so only the PoolManager is counted.
// PoolManager: https://tronscan.org/#/contract/TVjuTE3V5bMVdpfNhid8kD2v35T2k1u1Br
const POOL_MANAGER = 'TVjuTE3V5bMVdpfNhid8kD2v35T2k1u1Br'

// The pool list (token pairs) comes from the SUN.io API because Initialize-event log scanning is not available on Tron.
// Note: the API's `pairAddress` field holds the V4 PoolId (bytes32), not a contract address.
const POOL_LIST_API = 'https://sbc.endjgfsv.link/scan/getPoolList?version=v4'
const PAGE_SIZE = 100 // the API returns at most 100 pools per page
const MAX_PAGES = 100
// Skip dust pools: most are spam tokens (fake USDT etc.) and some of their balanceOf calls exceed the Tron node CPU limit,
// which fails the whole balance multicall. Pools below this size hold a negligible share of TVL.
const MIN_POOL_LIQUIDITY_USD = 1000
const TRX_PLACEHOLDER = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb' // native TRX in the SUN.io API (0x0 address)

/**
 * Collects the tokens of all SunSwap V4 pools with at least MIN_POOL_LIQUIDITY_USD of liquidity,
 * paging through the SUN.io pool list API until an empty page (at most MAX_PAGES pages).
 * Native TRX is returned as nullAddress so its balance is read as the native coin.
 * @returns {Promise<string[]>} unique token addresses
 * @throws if the list has more than MAX_PAGES pages, a page only repeats earlier pools (the API ignored pageNo), or no pool is found
 */
async function getTokens() {
  const tokens = new Set()
  const seenPools = new Set()
  // Fetch one page past MAX_PAGES: it must be empty, otherwise the list was cut off and TVL would be partial.
  for (let pageNo = 1; pageNo <= MAX_PAGES + 1; pageNo++) {
    const { data } = await get(`${POOL_LIST_API}&pageNo=${pageNo}&pageSize=${PAGE_SIZE}`, { timeout: 30000 })
    if (!Array.isArray(data)) throw new Error(`sunswap-v4: unexpected pool list response for page ${pageNo}`)
    if (!data.length) break // an empty page is the end of the list
    if (pageNo > MAX_PAGES) throw new Error(`sunswap-v4: pool list has more than ${MAX_PAGES} pages`)
    let newPools = 0
    for (const pool of data) {
      if (seenPools.has(pool.pairAddress)) continue
      seenPools.add(pool.pairAddress)
      newPools++
      if (!(Number(pool.liquidity) >= MIN_POOL_LIQUIDITY_USD)) continue
      tokens.add(pool.token0Address)
      tokens.add(pool.token1Address)
    }
    if (!newPools) throw new Error(`sunswap-v4: pool list page ${pageNo} repeats earlier pools`) // the API ignored pageNo: fail instead of reporting a partial TVL
  }
  if (!tokens.size) throw new Error('sunswap-v4: pool list is empty')
  return [...tokens].map(t => (t === TRX_PLACEHOLDER ? nullAddress : t))
}

async function tvl(api) {
  const tokens = await getConfig('sunswap-v4', undefined, { fetcher: getTokens })
  // Query balances in small batches: a single multicall with all tokens can hit the Tron node's CPU time limit.
  return sumTokens2({ api, owner: POOL_MANAGER, tokens, sumChunkSize: 20 })
}

module.exports = {
  methodology: 'TVL is the balance of all tokens (including native TRX) held by the SunSwap V4 singleton PoolManager contract. Tokens are discovered from the SUN.io pool list API (pools with at least $1k liquidity; smaller pools are mostly spam tokens).',
  start: '2026-03-01',
  // The pool list API only reflects current pools and liquidity, so this adapter cannot compute historical TVL
  // (same as other Tron adapters such as projects/justSwap). TVL is tracked from the listing date onwards.
  timetravel: false,
  tron: { tvl },
}
