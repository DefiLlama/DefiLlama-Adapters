const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [
      ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.null, // native ETH
    ],
  },
  ethereum: {
    owners: [
      "0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7", // system wallet
      "0x57e9e78a627baa30b71793885b952a9006298af6", // FastCCTP (USDC-only)
    ],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.null, // native ETH
    ],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts assets held in Lighter custody wallets for spot trade deposits, including native ETH (ADDRESSES.null) and USDC in the system wallet, plus USDC held in the FastCCTP bridge custody wallet, on Ethereum and Arbitrum.";
