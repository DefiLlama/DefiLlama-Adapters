const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owners: [
          "0xC1Ebd02f738644983b6C4B2d440b8e77DdE276Bd",
          "0x23122da8C581AA7E0d07A36Ff1f16F799650232f",
          "0xB2535b988dcE19f9D71dfB22dB6da744aCac21bf",
        ],
        fetchCoValentTokens: true,
        logArray,
      }),
  },
};
