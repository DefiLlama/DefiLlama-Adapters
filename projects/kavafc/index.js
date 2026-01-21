const { sumTokensExport } = require("../helper/unknownTokens");

const stakingValue = sumTokensExport({
  chain: "kava",
  owner: "0xa07deE8FF35fE2e2961a7e1006EAdA98E24aE82E",
  tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
  lps: ["0x09d6561b3795ae237e42f7adf3dc83742e10a2e8"],
  useDefaultCoreAssets: true,
});
const lionLiquidityStake = {
  kava: {
    staking: stakingValue,
    tvl: async () => ({}),
  },
};

module.exports = lionLiquidityStake;
