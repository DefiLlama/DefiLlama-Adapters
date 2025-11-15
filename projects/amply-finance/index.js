const { aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

module.exports = {
  methodology: methodologies.lendingMarket,
  cronos_zkevm: aaveExports(undefined, undefined, undefined, ['0x47656eb2A31094b348EBF458Eccb942d471324eD'], { v3: true, })
}