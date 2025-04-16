const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  plume: aaveExports("plume", undefined, undefined, ['0x6e2921D5C907f47Fd6A577A992920C9b9Acc7F23'], { v3: true }),
  plume_mainnet: aaveExports("plume_mainnet", undefined, undefined, ['0xf105eC94b0b9c687C4257cEA7eda7C2E5d6AF115'], { v3: true }),
}