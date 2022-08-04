const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0xE01cF83a89e8C32C0A9f91aCa7BfE554EBEE7141";

module.exports = {
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      coreAssets: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // wavax
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
        '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
        '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
      ]
    }),
  },
};