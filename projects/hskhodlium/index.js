const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const STAKING_CONTRACT = "0xd30a4ca3b40ea4ff00e81b0471750aa9a94ce9b1";

module.exports = {
  methodology: "TVL includes all native HSK tokens staked at the main contract on HashKey Chain. Token price is derived from its Ethereum-wrapped version.",
  hsk: {
    tvl: sumTokensExport({ owner: STAKING_CONTRACT, token: ADDRESSES.null }),
  },
};

