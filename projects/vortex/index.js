const { toUSDTBalances } = require('../helper/balances');
const VortexAPI = require("./vortex.api");

const tvl = async () => {
  return toUSDTBalances(await VortexAPI.getDexTvl());
};
const staking = async () => {
  return toUSDTBalances(await VortexAPI.getTotalStakingTvl());

};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  tezos: {
    tvl,
    staking
  },
};
