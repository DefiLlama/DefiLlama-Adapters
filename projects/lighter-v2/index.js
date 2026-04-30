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
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      '0x514910771af9ca656af840dff83e8264ecf986ca',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
      '0x56072C95FAA701256059aa122697B133aDEd9279',
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
