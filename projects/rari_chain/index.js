const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x255f80Ef2F09FCE0944faBb292b8510F01316Cf0",
          "0x8bE956aB42274056ef4471BEb211b33e258b7324",
          "0x46406c88285AD9BE2fB23D9aD96Cb578d824cAb6",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
