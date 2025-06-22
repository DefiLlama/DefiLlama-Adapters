const abi = require('./abi.json');
const { aaveExports } = require('../helper/aave');

module.exports = {
  telos: aaveExports('', '0xBD22b441d8Fb855C48aCf7a4142f873a44fe9767', undefined, undefined, { abis: abi })
}

module.exports.telos.borrowed = () => ({})
module.exports.deadFrom = '2025-01-01' 