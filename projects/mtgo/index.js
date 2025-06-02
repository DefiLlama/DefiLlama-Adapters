const { sumTokensExport } = require('../helper/unknownTokens')

const lpToken = "0x2a382b6d2dac1cba6e4820fd04e3c2c14e1aa7b2";
const treasuryAddress = "0xdE2957506B6dC883963fbE9cE45a94a8A22c6006";
const mtgoToken = "0x1bc8547e3716680117d7ba26dcf07f2ed9162cd0";
const poolAddress = "0x1781d2e9b4c7c0a3657411a64d2c1dfc50118772";

module.exports = {
  iotex: {
    tvl: async () => ({}),
    pool2: sumTokensExport({ tokensAndOwners: [[lpToken, poolAddress]], lps:[lpToken]}),
    // treasury: sumTokensExport({ tokensAndOwners: [[lpToken, treasuryAddress]], lps:[lpToken]}),
  },
};
