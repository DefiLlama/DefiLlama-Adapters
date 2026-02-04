const { compoundExports2 } = require('../helper/compound')
module.exports = {
  arbitrum: compoundExports2({ comptroller: '0x712E2B12D75fe092838A3D2ad14B6fF73d3fdbc9', cether: '0xaffd437801434643b734d0b2853654876f66f7d7' }),
}

// NOTE: borrowed function zeroed out due to bad debt
// The compoundExports2 helper would normally calculate borrowed amounts, but we override it to return empty object
module.exports.arbitrum.borrowed = () => ({})