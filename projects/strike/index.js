const { compoundExports2 } = require('../helper/compound');

module.exports.ethereum = compoundExports2({ comptroller: '0xe2e17b2CBbf48211FA7eB8A875360e5e39bA2602', cether: '0xbee9cf658702527b0acb2719c1faa29edc006a92' })

// NOTE: borrowed function zeroed out due to bad debt
// The compoundExports2 helper would normally calculate borrowed amounts, but we override it to return empty object
module.exports.ethereum.borrowed = () => ({})
