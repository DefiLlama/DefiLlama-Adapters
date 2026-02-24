const { aaveExports } = require("../helper/aave");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  {
    sei: aaveExports(undefined, '', undefined, ['0x60c82a40c57736a9c692c42e87a8849fb407f0d6']), // main
  },
  {
    sei: aaveExports(undefined, '', undefined, ['0xE77F4334D2Ce16c19F66fD62c653377A39AEFee1']),  // solv
  }
])
