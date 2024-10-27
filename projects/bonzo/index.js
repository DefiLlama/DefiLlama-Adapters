const { aaveV2Export, methodology } = require("../helper/aave")

module.exports = {
  timetravel: false,
  methodology,
  hedera: aaveV2Export('0x236897c518996163E7b313aD21D1C9fCC7BA1afc'),
}