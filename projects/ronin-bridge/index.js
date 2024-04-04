const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: ["0x64192819Ac13Ef72bF6b5AE239AC672B43a9AF08"],
        fetchCoValentTokens: true,
        blacklistedTokens: [],
      }),
  },
};
