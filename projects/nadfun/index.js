const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Value of monad tokens in the bonding curve',
  monad: {
    tvl: sumTokensExport({ owner: '0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE', tokens: ['0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A']}),
  },
}