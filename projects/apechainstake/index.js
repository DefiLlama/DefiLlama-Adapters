const { nullAddress } = require('../helper/unwrapLPs')
const APE_STAKE_CONTRACT = "0x4Ba2396086d52cA68a37D9C0FA364286e9c7835a"

// getPoolsUI() started reverting on every RPC after the last staking season ended (2025-12-11);
// staked APE is native on apechain, so the contract's native balance is the staked amount
async function stakingTvl(api) {
  return api.sumTokens({ owner: APE_STAKE_CONTRACT, tokens: [nullAddress] })
}

module.exports = {
  apechain: {
    tvl: () => ({}),
    staking: stakingTvl
  }
};
