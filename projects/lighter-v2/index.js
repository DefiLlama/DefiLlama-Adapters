const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
  },
  ethereum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.null],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts tokens held in the Lighter system wallet on Ethereum and Arbitrum.";
