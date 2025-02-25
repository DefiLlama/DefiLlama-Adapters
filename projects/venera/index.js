const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");
const MasterChef = "0xE947062374759D9Dad48B375030099b1ADe1a9c7";
const token = "0x94174f59c009f49b6aBC362706fdA402616b0427";

module.exports = {
  bsc: {
    tvl: getUniTVL({
      factory: "0x95F9c44fA1585811e1D1a0F59e74174B657B37A5",
      useDefaultCoreAssets: true,
    }),
    staking: staking(MasterChef, token),
  },
};
