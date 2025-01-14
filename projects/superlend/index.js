const { aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

module.exports = {
  methodology: methodologies.lendingMarket,
  etlk: aaveExports('etlk', "0xEcbDd440C7a929d7524784Af634dF9EB0747b9e7", undefined, ["0x99e8269dDD5c7Af0F1B3973A591b47E8E001BCac"], { v3: true }),
}