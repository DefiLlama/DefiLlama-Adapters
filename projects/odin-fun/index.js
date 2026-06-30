const { get } = require('../helper/http')

const TVL_ENDPOINT = 'https://api.odin.fun/v1/statistics/defillama/tvl'

async function tvl() {
  const response = await get(TVL_ENDPOINT)

  // The API returns three non-overlapping TVL components, all in millisatoshis:
  //
  // 1. user_balances: BTC deposited in user accounts (idle BTC not yet deployed into
  //    tokens) + BTC-denominated value of rune/external tokens held by users.
  //    Regular launchpad tokens are excluded to avoid double-counting with launchpad_btc.
  //    LP token balances are also excluded to avoid double-counting with amm_btc.
  //
  // 2. launchpad_btc: Net BTC locked in bonding curves for pre-graduation tokens.
  //    Calculated as cumulative buy volume minus sell volume on bonding curve trades.
  //
  // 3. amm_btc: BTC in AMM liquidity pools for graduated/rune/external tokens.
  //    Calculated as btc_liquidity × 2 to reflect both sides of each pool
  //    (in a balanced x*y=k AMM, the token side equals the BTC side in value).
  //
  // These three components are mutually exclusive:
  // - When a user buys a launchpad token, BTC leaves user_balances and enters launchpad_btc
  // - When a token graduates to AMM, BTC moves from bonding curve to amm_btc
  // - User-held rune/external tokens are valued separately from AMM pool liquidity

  const userBalancesMSats = Number(response.user_balances)
  const launchpadMSats = Number(response.launchpad_btc)
  const ammMSats = Number(response.amm_btc)

  if (!Number.isFinite(userBalancesMSats) || !Number.isFinite(launchpadMSats) || !Number.isFinite(ammMSats)) {
    throw new Error(`Invalid Odin.fun TVL payload: user_balances=${response.user_balances}, launchpad_btc=${response.launchpad_btc}, amm_btc=${response.amm_btc}`)
  }

  // Convert millisatoshis to BTC (1 BTC = 1e11 millisatoshis)
  return {
    'coingecko:bitcoin': (userBalancesMSats + launchpadMSats + ammMSats) / 1e11
  }
}

module.exports = {
  methodology: "TVL is the total BTC on the Odin.fun platform: user deposit balances, BTC locked in launchpad bonding curves, and BTC in AMM liquidity pools (counted as BTC liquidity × 2 to reflect both sides of each pool). These three components are non-overlapping.",
  timetravel: false,
  icp: { tvl },
}
