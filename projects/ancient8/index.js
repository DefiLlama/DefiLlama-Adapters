const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x12d4E64E1B46d27A00fe392653A894C1dd36fb80",
          "0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
