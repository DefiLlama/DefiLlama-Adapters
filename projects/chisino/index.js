const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  megaeth: {
    tvl: sumTokensExport({
      owner: '0x99B09549CA6e0F082E449D341111290e50F5cdB2',
      token: '0x5dF82810CB4B8f3e0Da3c031cCc9208ee9cF9500', // aMegUSDm
    }),
  }
}
