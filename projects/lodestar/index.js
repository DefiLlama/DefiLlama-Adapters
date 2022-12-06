const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getCompoundV2Tvl, compoundExports } = require("../helper/lodestar");
const {  transformBscAddress } = require('../helper/portedTokens')

const abiCerc20 = require("./cerc20.json");
const abiCereth2 = require("./creth2.json");
const BigNumber = require("bignumber.js");

module.exports = {
  hallmarks: [
  ],
  timetravel: false, // bsc and fantom api's for staked coins can't be queried at historical points
  // start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  arbitrum:compoundExports("0x8f2354F9464514eFDAe441314b8325E97Bf96cdc", "arbitrum"),
};
