const { aaveV2Export, methodology, } = require('../helper/aave');
const { mergeExports, } = require('../helper/utils');

module.exports = mergeExports([
  { ethereum: aaveV2Export('0x9f72DC67ceC672bB99e3d02CbEA0a21536a2b657'), },
  {
    ethereum: aaveV2Export('0xA422CA380bd70EeF876292839222159E41AAEe17'),
    fantom: aaveV2Export('0x7ff2520cd7b76e8c49b5db51505b842d665f3e9a'),
    methodology,
  }
])
module.exports.hallmarks = [
  ['2023-06-11', 'Protocol was hacked'],
]
module.exports.doublecounted = true
