const axios = require('axios')

const TVL_ENDPOINT = 'https://app.strato.nexus/api/metrics/tvl'

const CG_TOKEN_MAP = {
  ETH: 'ethereum',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  wstETH: 'wrapped-steth',
  rETH: 'rocket-pool-eth',
  PAXG: 'pax-gold',
  XAUt: 'tether-gold',
  sUSDS: 'susds',
  syrupUSDC: 'syrupusdc',
}

async function tvl(api) {
  const { data } = await axios.get(TVL_ENDPOINT)
  const assets = data?.assets ?? []

  for (const asset of assets) {
    if (!asset?.symbol || asset.amount == null) continue
    const decimals = Math.pow(10, asset.decimals ?? 18)
    const amount = asset.amount / decimals
    const cgId = CG_TOKEN_MAP[asset.symbol]
    if (cgId) {
      api.addCGToken(cgId, amount)
    } else {
      const usdValue = asset.totalUsd / decimals
      api.addUSDValue(usdValue)
    }
  }
}

module.exports = {
  methodology: 'Counts underlying assets locked in STRATO DeFi contracts across CDP, lending, pools, saveUSDST, safety module, and vaults. Excludes wallet balances, receipt/share tokens, protocol debt, and double counting.',
  misrepresentedTokens: true,
  timetravel: false,
  start: 1775151906,
  strato: { tvl },
}
