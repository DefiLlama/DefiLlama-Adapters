const { get } = require('../helper/http')

const TVL_INPUTS_URL = 'https://dlhkk-raaaa-aaaak-qyl5a-cai.raw.icp0.io/api/external/v1/live/tvl_inputs.json'
const EXPECTED_POOL_IDS = new Set([9, 10, 11, 12, 13, 14])
const COINGECKO_BY_SYMBOL = {
  ICP: 'internet-computer',
  ETH: 'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
}

function decodeNat(value) {
  if (Array.isArray(value)) {
    // num-bigint serde serializes large nats as little-endian u32 limbs
    return value.reduce((acc, limb, i) => acc + (BigInt(limb) << BigInt(32 * i)), 0n)
  }
  return BigInt(value)
}

async function tvl(api) {
  const data = await get(TVL_INPUTS_URL)
  const seen = new Set()

  for (const pool of data.pools) {
    const poolId = Number(decodeNat(pool.pool_id))
    if (!EXPECTED_POOL_IDS.has(poolId)) continue
    if (!pool.enabled || !pool.public_visible || pool.legacy) continue
    seen.add(poolId)

    for (const side of ['0', '1']) {
      const symbol = String(pool[`token${side}_symbol`]).toUpperCase()
      const coingeckoId = COINGECKO_BY_SYMBOL[symbol]
      if (!coingeckoId) throw new Error(`Unexpected token in pool ${poolId}: ${symbol}`)
      const decimals = Number(decodeNat(pool[`token${side}_decimals`]))
      const rawAtomic = decodeNat(pool[`reserve${side}_atomic`])
      api.addCGToken(coingeckoId, Number(rawAtomic) / 10 ** decimals)
    }
  }

  for (const expected of EXPECTED_POOL_IDS) {
    if (!seen.has(expected)) throw new Error(`Missing expected SSS pool id: ${expected}`)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL includes only enabled public non-legacy SSS canonical pool reserves on the Internet Computer. Canonical assets are ICP, ETH, USDC, and USDT. User balances, pending deposits, pending withdrawals, route reserves, treasury reserves, protocol fee vaults, referral liabilities, hidden pools, disabled pools, legacy pools, and settlement-route assets are excluded.',
  icp: { tvl },
}
