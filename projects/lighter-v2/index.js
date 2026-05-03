const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
  },
  ethereum: {
    owners: ["0x3b4d794a66304f130a4db8f2551b0070dfcf5ca7"],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.null,
      ADDRESSES.ethereum.AAVE,
      ADDRESSES.ethereum.LINK,
      ADDRESSES.ethereum.UNI,
      ADDRESSES.ethereum.LIDO,
      '0x56072C95FAA701256059aa122697B133aDEd9279',
      '0xA27EC0006e59f245217Ff08CD52A7E8b169E62D2',
    ],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts tokens deposited by users into the Lighter ZK rollup contract on Ethereum and Arbitrum. Excludes Lighter's own LIT governance token.";
