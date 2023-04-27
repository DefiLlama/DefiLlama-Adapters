const { sumTokensExport } = require("../helper/unwrapLPs");

// Lybra holds total stake collateral (deposited ETH)
const LYBRA_CONTRACT = "0x97de57eC338AB5d51557DA3434828C5DbFaDA371";

module.exports = {
  start: 1682265600,
  ethereum: {
    tvl: sumTokensExport({ owner: LYBRA_CONTRACT, tokens: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84']}),
  }
};
