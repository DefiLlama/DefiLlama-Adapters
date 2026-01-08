const { aaveV2Export } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  sty: aaveV2Export('0xC62Af8aa9E2358884B6e522900F91d3c924e1b38', { isAaveV3Fork: true }),
}

module.exports.sty.borrowed = () => ({}) // hacked