const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC_BASE = ADDRESSES.base.USDC; 
const POOL_CONTRACTS = [
  "0xa01946A5f6a167e5dDE667C14a4c1841a0B12eA3",
];

const config = {
  base: {
    owners: POOL_CONTRACTS, 
    tokens: [USDC_BASE],
  },
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain]),
  };
});

module.exports.methodology = "TVL is calculated by summing USDC balances held in Bullbit pool contracts on Base.";