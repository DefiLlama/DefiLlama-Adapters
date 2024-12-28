const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x2f285781B8d58678a3483de52D618198E4d27532",
          "0xb4951c0C41CFceB0D195A95FE66280457A80a990",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
