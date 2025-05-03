const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x885af16f25c3673a64e07e58c6c5536ea99c1a97', // Uniswap V3 pool address
      tokens: [
        '0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2', // WETH
        '0x6507A08A3749A7dcf1a3d7b2B28E6a26E3E8d3b5', // Ethereum (ETH) custom token
      ],
    }),
  },
};
