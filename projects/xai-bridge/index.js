const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xb591cE747CF19cF30e11d656EB94134F523A9e77",
          "0xb15A0826d65bE4c2fDd961b72636168ee70Af030",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
