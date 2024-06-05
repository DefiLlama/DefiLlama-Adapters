const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  rsk: {
    tvl: sumTokensExport({ owner: '0xCff3FCaEc2352C672C38d77cB1A064B7d50CE7e1', tokens: ['0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5']})
  }
}