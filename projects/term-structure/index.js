const { sumTokens2 } = require("../helper/unwrapLPs");

const ZkTrueUpContractAddress = "0x09E01425780094a9754B2bd8A3298f73ce837CF9";
module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          ZkTrueUpContractAddress,
        ],
        fetchCoValentTokens: true,
      }),
  },
};
