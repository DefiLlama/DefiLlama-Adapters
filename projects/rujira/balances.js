const DECIMAL_PLACES = 18
const TOKEN_DECIMALS = 8
const DECIMAL_SCALE = 10n ** BigInt(DECIMAL_PLACES)

const DENOM_TO_COINGECKO = {
  rune: 'thorchain',
  'x/ruji': 'rujira',
  'thor.ruji': 'rujira',
  tcy: 'tcy',
  'thor.tcy': 'tcy',
  'thor.lqdy': 'liquidy',
  'btc-btc': 'bitcoin',
  'eth-eth': 'ethereum',
  'base-eth': 'ethereum',
  'doge-doge': 'dogecoin',
  'bch-bch': 'bitcoin-cash',
  'ltc-ltc': 'litecoin',
  'xrp-xrp': 'ripple',
  'gaia-atom': 'cosmos',
  'avax-avax': 'avalanche-2',
  'bsc-bnb': 'binancecoin',
  'tron-trx': 'tron',
}

function parseDecimal(value) {
  const [whole, fraction = ''] = String(value).split('.')
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > DECIMAL_PLACES)
    throw new Error(`Invalid CosmWasm decimal: ${value}`)
  return BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(DECIMAL_PLACES, '0') || '0')
}

function addScaled(balances, denom, value) {
  if (value) balances[denom] = (balances[denom] || 0n) + value
}

function addDecimal(balances, denom, value) {
  addScaled(balances, denom, parseDecimal(value))
}

function addRaw(balances, denom, value) {
  addScaled(balances, denom, BigInt(value) * DECIMAL_SCALE)
}

function formatUnits(value, decimals) {
  const scale = 10n ** BigInt(decimals)
  const whole = value / scale
  const fraction = (value % scale).toString().padStart(decimals, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

function coingeckoId(denom) {
  if (DENOM_TO_COINGECKO[denom]) return DENOM_TO_COINGECKO[denom]
  if (/-usdc-/i.test(denom)) return 'usd-coin'
  if (/-usdt-/i.test(denom)) return 'tether'
  if (/-wbtc-/i.test(denom)) return 'wrapped-bitcoin'
  if (/-dai-/i.test(denom)) return 'dai'
  if (/-gusd-/i.test(denom)) return 'gemini-dollar'
  if (/-lusd-/i.test(denom)) return 'liquity-usd'
  if (/-usdp-/i.test(denom)) return 'paxos-standard'
  if (/-cbbtc-/i.test(denom)) return 'coinbase-wrapped-btc'
  throw new Error(`No verified DefiLlama price mapping for Rujira denom ${denom}`)
}

function addToApi(api, balances) {
  for (const [denom, value] of Object.entries(balances)) {
    if (!value) continue
    // All aggregation remains bigint until the SDK's fractional CoinGecko handoff.
    const amount = Number(formatUnits(value, DECIMAL_PLACES + TOKEN_DECIMALS))
    if (!Number.isFinite(amount)) throw new Error(`Invalid aggregate amount for ${denom}`)
    api.addCGToken(coingeckoId(denom), amount)
  }
}

module.exports = { addDecimal, addRaw, addScaled, addToApi, parseDecimal }
