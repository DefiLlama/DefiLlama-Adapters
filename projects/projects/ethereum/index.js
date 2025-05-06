const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x7541E21e2F98ef07A286eE52a133FbfF3C9F902d', // Uniswap V2 pair address
      tokens: [
        '0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2', // WETH
        '0x6507A08A3749A7dcf1a3d7b2B28E6a26E3E8d3b5'  // EDV Token (Ethereum-mimic)
      ],
    }),
  },
};
