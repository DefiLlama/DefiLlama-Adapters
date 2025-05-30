const { compoundExports2, methodology } = require('../helper/compound')

module.exports = {
  scroll: compoundExports2({ comptroller: '0x8a67AB98A291d1AEA2E1eB0a79ae4ab7f2D76041', cether: '0x639355f34Ca9935E0004e30bD77b9cE2ADA0E692' }),
  methodology,
}


module.exports.hallmarks = [
  [1721347200, "Protocol Exploit"],
]