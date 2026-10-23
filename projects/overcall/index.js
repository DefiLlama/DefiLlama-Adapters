// Overcall: skill-based markets on Robinhood Chain (Channels, and predictions on other players' channels), priced by
// Chainlink Data Streams and settled onchain. Every currency has its own vault, the counterparty of every position in
// it, funded by the protocol: the vaults' house capital and fee revenue are tracked as treasury
// (projects/treasury/overcall.js), so no tvl is counted here. Staking: $OVER staked in the staking contract.
// Contracts: ChannelGame 0x1C7dDdc2fA9BEc0549FcdeabcfeBD37452d2CDCb.
const OVER = '0x6245Db7f52379bD9757c9DdcE6519768FfaB3a4F' // the protocol's own token
const OVER_STAKING = '0x2165E659406F6B4F122F10A540B634252249b306'
// $OVER is priced by its CoinGecko id: the coins server has no price for its Robinhood Chain address yet
const OVER_CG = 'overcall'

async function staking(api) {
  const staked = await api.call({ abi: 'erc20:balanceOf', target: OVER, params: [OVER_STAKING] })
  api.addCGToken(OVER_CG, Number(staked) / 1e18)
}

module.exports = {
  methodology: 'Every currency has its own vault, the counterparty of every position in it, funded by the protocol: the vaults\' house capital and fee revenue are tracked as treasury, so no TVL is counted. Staking counts the $OVER staked in the staking contract.',
  start: '2026-10-20',
  robinhood: {
    tvl: () => ({}),
    staking,
  },
}
