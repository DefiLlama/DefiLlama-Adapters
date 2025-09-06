const { sumTokensExport } = require("../helper/unwrapLPs");

const RED_ETH = "0xc43c6bfeDA065fE2c4c11765Bf838789bd0BB5dE";
const STRATEGY_MANAGER_ETH = "0x903a1FF023a35EFeD333ee9D6bF30629A098B9ed";

module.exports = {
  timetravel: true,
  ethereum: {
    tvl: async () => ({}),
    staking: sumTokensExport({
      owners: [STRATEGY_MANAGER_ETH],
      tokens: [RED_ETH],
    }),
  },
};
