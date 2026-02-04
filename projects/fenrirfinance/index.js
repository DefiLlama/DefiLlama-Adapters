const { compoundExports2 } = require('../helper/compound');

module.exports.bsc = compoundExports2({ comptroller: '0x56b4B49f31517be8DacC2ED471BCc20508A0e29D' })

// NOTE: borrowed function zeroed out due to bad debt
// The compoundExports2 helper would normally calculate borrowed amounts, but we override it to return empty object
module.exports.bsc.borrowed = () => ({})
