const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B', // BOB
      ],
      owner: '0x72e6b59d4a90ab232e55d4bb7ed2dd17494d62fb'
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      tokens: [
        '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b', // BOB
      ],
      owner: '0x1ca8c2b9b20e18e86d5b9a72370fc6c91814c97c'
    }),
  },
}