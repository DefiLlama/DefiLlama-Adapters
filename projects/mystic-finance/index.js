const {CONFIG } = require("./constants.js")
const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports.methodology = methodologies.lendingMarket

Object.keys(CONFIG).forEach((chain) => {
  const poolDatas = CONFIG[chain];
  module.exports[chain] = aaveExports(chain, undefined, undefined, poolDatas, { v3: true })
});

