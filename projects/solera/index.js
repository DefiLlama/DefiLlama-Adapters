const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  plume_mainnet: aaveExports("plume_mainnet", undefined, undefined, ['0x4A6609C56F69836E0Bb53A96494f45f89EafA811'], { v3: true }),
}
