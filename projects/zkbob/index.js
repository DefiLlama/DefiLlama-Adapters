const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      chain: 'polygon',
      tokens: [
        '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B', // BOB
      ],
      owner: '0x72e6b59d4a90ab232e55d4bb7ed2dd17494d62fb'
    })
  }
}