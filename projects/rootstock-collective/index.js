const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  rsk: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: '0x5db91e24BD32059584bbDb831A901f1199f3d459', tokens: ['0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5']})
  }
}
