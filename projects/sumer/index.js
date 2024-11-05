const { compoundExports2 } = require('../helper/compound')

module.exports = {
  meter: compoundExports2({ comptroller: '0xcB4cdDA50C1B6B0E33F544c98420722093B7Aa88' }),
  base: compoundExports2({ comptroller: '0x611375907733D9576907E125Fb29704712F0BAfA' }),
  arbitrum: compoundExports2({ comptroller: '0xBfb69860C91A22A2287df1Ff3Cdf0476c5aab24A' }),
  ethereum: compoundExports2({ comptroller: '0x60A4570bE892fb41280eDFE9DB75e1a62C70456F' }),
  zklink: compoundExports2({ comptroller: '0xe6099D924efEf37845867D45E3362731EaF8A98D' }),
  bsquared: compoundExports2({ comptroller: '0xdD9C863197df28f47721107f94eb031b548B5e48' }),
}