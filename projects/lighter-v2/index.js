const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: ["0xaf88d065e77c8cc2239327c5edb3a432268e5831"],
  },
  ethereum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts USDC tokens held in the Lighter system wallet on Ethereum and Arbitrum.";
