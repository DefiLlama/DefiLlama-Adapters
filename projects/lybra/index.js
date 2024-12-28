const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

// Lybra holds total stake collateral (deposited ETH)
const LYBRA_CONTRACT = "0x97de57eC338AB5d51557DA3434828C5DbFaDA371";

module.exports = {
  start: '2023-04-23',
  ethereum: {
    tvl: sumTokensExport({ owner: LYBRA_CONTRACT, tokens: [ADDRESSES.ethereum.STETH]}),
  }
};
