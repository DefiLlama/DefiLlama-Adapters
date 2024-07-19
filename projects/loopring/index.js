const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x944644Ea989Ec64c2Ab9eF341D383cEf586A5777",
          "0x674bdf20A0F284D710BC40872100128e2d66Bd3f",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
