const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  methodology: "TVL is total TON deposited in the IslandStake liquid staking pool, read on-chain via get_pool_data getter on the master contract (pool_ton_balance). iTON is the liquid staking receipt jetton.",
  ton: {
    tvl: async (api) => {
      const result = await call({ target: 'EQD4l0TnN13SmF_wSIL6ho1sBmqc4H_KN1kFqPjLJgIpkBOZ', abi: 'get_pool_data' });
      api.addGasToken(result[3]);
    },
  },
};
