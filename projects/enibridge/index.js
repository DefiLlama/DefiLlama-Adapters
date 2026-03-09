const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "TVL is calculated by summing the total value of all tokens locked in the protocol’s smart contracts on the source chains.",
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0x34F64B5E7FBC9C04Fe8F361bd73B5cde5AFe28B7',
        fetchCoValentTokens: true,
      }),
  },
};