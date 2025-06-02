const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  rsk: {
    tvl: sumTokensExport({ owner: '0xA27024eD70035E46DBa712609FC2AFA1c97aa36a', tokens: ['0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5']})
  }
}