const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  occ: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12', '0x07e4465c8f7A47a77761566A639C0a1CF26800dC'],
      ]
    })
  }
}