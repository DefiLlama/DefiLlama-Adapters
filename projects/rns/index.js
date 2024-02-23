const sdk = require("@defillama/sdk")
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  rsk: {
    tvl: sumTokensExport({ owner: '0x39e00d2616e792f50ddd33bbe46e8bf55eadebee', tokens: ['0x2acc95758f8b5f583470ba265eb685a8f45fc9d5']})
  }
}