const { compoundExports2 } = require('../helper/compound');

module.exports.deadFrom='2023-11-12'
module.exports.ethereum = compoundExports2({ comptroller: '0x3105D328c66d8d55092358cF595d54608178E9B5', cether: '0xFaCecE87e14B50eafc85C44C01702F5f485CA460' })

module.exports.ethereum.borrowed = () => ({}) // bad debt