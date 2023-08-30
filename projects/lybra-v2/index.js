const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

// Lybra holds total stake collateral (deposited ETH)
const LYBRA_CONTRACT = "0xed1167b6Dc64E8a366DB86F2E952A482D0981ebd";

module.exports = {
  start: 17990519,
  ethereum: {
    tvl: sumTokensExport({ owner: LYBRA_CONTRACT, tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.sfrxETH]}),
  }
};
