const { get } = require('../helper/http')

const TVL_ENDPOINT = 'https://api.odin.fun/v1/statistics/defillama/tvl'

async function tvl() {
  const response = await get(TVL_ENDPOINT)
  // launchpad_btc: BTC locked in bonding curves (millisatoshis)
  // amm_btc: BTC in AMM pools × 2 (millisatoshis)
  const launchpadMSats = Number(response.launchpad_btc)
  const ammMSats = Number(response.amm_btc)
  return {
    'coingecko:bitcoin': (launchpadMSats + ammMSats) / 1e11
  }
}

module.exports = {
  methodology: "TVL is the total BTC locked in Odin.fun, including BTC in launchpad bonding curves and BTC in AMM liquidity pools (counted as BTC liquidity × 2 to reflect both sides of each pool).",
  timetravel: false,
  bitcoin: { tvl },
}
