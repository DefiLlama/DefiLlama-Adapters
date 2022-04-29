const VortexAPI = require("./vortex.api");
const {toUSDTBalances} = require('../helper/balances')

const tvl = async () => {
  const [dexTvlUsd] = await Promise.all([
    VortexAPI.getDexTvl(),
  ]);

  return toUSDTBalances( dexTvlUsd); 
}

const staking = async () => {
  const [stakingTvlUsd] = await Promise.all([
    VortexAPI.getTotalStakingTvl(),
  ]);

  return toUSDTBalances( stakingTvlUsd);
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  tezos: {
    tvl,
    staking
  },
};
