const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xd5ec14a83B7d95BE1E2Ac12523e2dEE12Cbeea6C",
          "0x470458C91978D2d929704489Ad730DC3E3001113",
          "0x153A69e4bb6fEDBbAaF463CB982416316c84B2dB",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
