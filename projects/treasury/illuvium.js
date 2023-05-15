const { treasuryExports, nullAddress } = require("../helper/treasury");

const Treasury = "0x58c37a622cdf8ace54d8b25c58223f61d0d738aa";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [],
    owners: [Treasury],
  },
  ethereum: {
    tokens: [nullAddress, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xdac17f958d2ee523a2206206994597c13d831ec7', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', '0x5afe3855358e112b5647b952709e6165e1c1eeee' ],
    owners: [Treasury],
    ownTokens: ['0x767fe9edc9e0df98e07454847909b5e959d7ca0e'],
  }
})