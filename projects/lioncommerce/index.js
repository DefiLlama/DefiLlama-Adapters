const { stakingPricedLP } = require("../helper/staking");
const { unknownTombs, sumTokensExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

const stakingValue = sumTokensExport({
  chain: "kava",
  owner: "0x52b18024e084150e001a34be9c7a41706517d79f",
  tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
  lps: ["0x59e38a5799B64fE17c5fAb7E0E5396C15E2acb7b"],
  useDefaultCoreAssets: true,
});
const lionStaking = {
  kava: {
    staking: stakingValue,
    tvl: async () => ({}),
  },
};

module.exports = lionStaking;
