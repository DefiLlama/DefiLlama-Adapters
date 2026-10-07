const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

// Hyperlane HypERC20Collateral routers (core 12.1.0) holding the bridged collateral on Robinhood Chain
const AEVA = '0xe8729Dc9dCA85167e06b7E9c66a58b22457c5F30'
const AEVA_ROUTER = '0xA880B6e6511DAF5A0Bdde96EE8b36D8004D9D7eD'
const USDG_ROUTER = '0x856a649A84C8c6bB1e2541097bB293af5DD57857'

module.exports = {
  methodology: "TVL counts the USDG locked in the Aeva bridge's Hyperlane collateral router on Robinhood Chain, which backs aeUSD on Aeva Mainnet. $AEVA locked in the AEVA router is Aeva's own token and is counted under staking.",
  start: '2026-09-28',
  robinhood: {
    tvl: (api) => api.sumTokens({ owner: USDG_ROUTER, tokens: [ADDRESSES.robinhood.USDG] }),
    staking: staking(AEVA_ROUTER, AEVA),
  },
}
