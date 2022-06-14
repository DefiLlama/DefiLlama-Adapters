const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x9c60c867ce07a3c403e2598388673c10259ec768";

module.exports = {
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      coreAssets: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
        '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
      ]
    }),
  },
};