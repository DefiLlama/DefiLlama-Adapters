const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
  },
  ethereum: {
    owners: [
      "0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7", // system wallet
      "0x57e9e78a627baa30b71793885b952a9006298af6", // FastCCTP
    ],
    tokens: [ADDRESSES.ethereum.USDC],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts USDC held in the Lighter system wallet and FastCCTP bridge custody for spot trade deposits on Ethereum and Arbitrum.";
