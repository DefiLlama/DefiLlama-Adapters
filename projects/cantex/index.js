const { get } = require('../helper/http')

const POOLS_STATE_URL = 'https://api.cantex.io/v1/public/pools/state'
const TOKENS_INFO_URL = 'https://api.cantex.io/v1/public/tokens/info'
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (cantex)' } }

async function tvl(api) {
  const [state, tokenInfo] = await Promise.all([
    get(POOLS_STATE_URL, FETCH_OPTS),
    get(TOKENS_INFO_URL, FETCH_OPTS),
  ])

  // Canton instruments are identified by (admin, id); tokens/info maps each to
  // the CoinGecko coin it represents (null when it has no CoinGecko listing).
  const coingeckoIds = {}
  for (const token of tokenInfo?.tokens ?? []) {
    const info = token.info
    if (info?.coingecko_id)
      coingeckoIds[`${info.instrument_admin}:${info.instrument_id}`] = info.coingecko_id
  }
  if (!Object.keys(coingeckoIds).length)
    throw new Error('cantex: tokens/info returned no coingecko ids')

  const pools = state?.data?.pools
  if (!Array.isArray(pools) || pools.length === 0)
    throw new Error('cantex: pools/state returned no pools')

  for (const pool of pools) {
    addReserve(api, coingeckoIds, pool.token_a_instrument, pool.reserve_a)
    addReserve(api, coingeckoIds, pool.token_b_instrument, pool.reserve_b)
  }
}

function addReserve(api, coingeckoIds, instrument, reserve) {
  if (reserve == null) return // pool with no reserves yet
  const coingeckoId = coingeckoIds[`${instrument.admin}:${instrument.id}`]
  if (!coingeckoId) return // token without a CoinGecko listing is excluded from TVL
  // Reserves are decimal strings in whole token units; do not scale them again.
  const amount = Number(reserve)
  if (!Number.isFinite(amount) || amount < 0)
    throw new Error(`cantex: invalid reserve for ${instrument.id}`)
  api.addCGToken(coingeckoId, amount)
}

module.exports = {
  timetravel: false,
  methodology:
    'Cantex is an institutional-grade on-chain exchange built on the Canton Network. ' +
    'Liquidity providers deposit tokens into Cantex AMM pools; swaps execute against those pool reserves and settle atomically on-chain. ' +
    'TVL is the sum of the token reserves held in all live Cantex pools, read from the Cantex public API (/v1/public/pools/state), ' +
    'which serves per-pool reserve balances derived from on-chain Canton ledger events. ' +
    'Each Canton instrument is mapped to the CoinGecko coin it represents via /v1/public/tokens/info; ' +
    'tokens without a CoinGecko listing are excluded from TVL. Cantex has no borrow side, so nothing is netted.',
  canton: { tvl },
}
