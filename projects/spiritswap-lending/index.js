const { compoundExports2 } = require('../helper/compound')

module.exports = {
  hallmarks: [
    [1693526400, "Lending Network deprecated"]
  ],
  fantom: compoundExports2({ comptroller: '0x892701d128d63c9856A9Eb5d967982F78FD3F2AE' }),
}
module.exports.fantom.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 