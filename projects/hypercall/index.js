const { post } = require('../helper/http')

const API_URL = 'https://api.hyperliquid.xyz/info'
const EXCHANGE = '0xE6b7FaA216cabb2b38B392f577C9c826378b2240'

async function tvl(api) {
  // Perp/margin account
  const perp = await post(API_URL, { type: 'clearinghouseState', user: EXCHANGE })
  api.addCGToken('usd-coin', parseFloat(perp.marginSummary.accountValue))

  // Spot balances
  const spot = await post(API_URL, { type: 'spotClearinghouseState', user: EXCHANGE })
  for (const b of spot.balances || []) {
    const total = parseFloat(b.total)
    if (!total) continue
    if (b.coin === 'USDC') api.addCGToken('usd-coin', total)
    else if (b.coin === 'HYPE') api.addCGToken('hyperliquid', total)
  }
}

module.exports = {
  methodology: "Counts USDC collateral custodied in Hypercall's Exchange account on HyperCore (perp margin equity plus spot balances).",
  hyperliquid: { tvl },
}
