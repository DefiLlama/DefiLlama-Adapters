const { mycExports } = require("../helper/mycelium");

module.exports = {
  arbitrum: {
    tvl: mycExports({
      chain: "arbitrum",
      vault: "0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855",
      staking: "0x9B225FF56C48671d4D04786De068Ed8b88b672d6",
    }),
  },
};
