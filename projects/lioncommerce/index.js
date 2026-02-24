const { sumTokensExport } = require("../helper/unknownTokens");

const stakingValue = sumTokensExport({
  chain: "kava",
  owner: "0x52b18024e084150e001a34be9c7a41706517d79f",
  tokens: ["0x990e157fC8a492c28F5B50022F000183131b9026"],
  lps: ["0x09d6561b3795ae237e42f7adf3dc83742e10a2e8"],
  useDefaultCoreAssets: true,
});
const lionStaking = {
  kava: {
    staking: stakingValue,
    tvl: async () => ({}),
  },
};

module.exports = lionStaking;
