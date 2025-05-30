const abi = require('./abi.json');
const { aaveChainTvl } = require('../helper/aave');

function v2(chain, v2Registry) {
  abi.getAllATokens = abi.getAllOTokens
  const isV3 = false
  const options = { abis: abi }
  const section = borrowed => aaveChainTvl(chain, v2Registry, undefined, undefined, borrowed, isV3, options)
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  telos: v2("telos", "0xBD22b441d8Fb855C48aCf7a4142f873a44fe9767"),
}

module.exports.telos.borrowed = ()  => ({})
module.exports.deadFrom = '2025-01-01' 