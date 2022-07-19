const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0xE01cF83a89e8C32C0A9f91aCa7BfE554EBEE7141";

module.exports = {
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      coreAssets: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
        '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
        '0x90b630991aB2fa3BFCf6e7b380830E1C3Fb4BC4A', // XRP
      ]
    }),
  },
};