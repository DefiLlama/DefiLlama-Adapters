const { compoundExports2 } = require('../helper/compound')

module.exports = {
  meter: compoundExports2({ comptroller: '0xcB4cdDA50C1B6B0E33F544c98420722093B7Aa88' }),
  base: compoundExports2({ comptroller: '0x611375907733D9576907E125Fb29704712F0BAfA' }),
  arbitrum: compoundExports2({ comptroller: '0xBfb69860C91A22A2287df1Ff3Cdf0476c5aab24A' }),
}