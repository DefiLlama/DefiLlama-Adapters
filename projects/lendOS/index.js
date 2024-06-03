const { aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

module.exports = {
  methodology: methodologies.lendingMarket,
  neon_evm: aaveExports('', undefined, undefined, ['0x3A1ca459F21D8FAcF9A30bC4773f5dBf07C1191d'], { v3: true, }),
}