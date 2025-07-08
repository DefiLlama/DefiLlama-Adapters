const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B', // BOB
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDC_CIRCLE,
      ],
      owner: '0x72e6b59d4a90ab232e55d4bb7ed2dd17494d62fb'
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      tokens: [
        '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b', // BOB
        ADDRESSES.optimism.WETH_1,
      ],
      owners: ['0x1ca8c2b9b20e18e86d5b9a72370fc6c91814c97c', '0x58320A55bbc5F89E5D0c92108F762Ac0172C5992']
    }),
  },
  tron: {
    tvl: sumTokensExport({
      tokens: [ADDRESSES.tron.USDT,],
      owners: ['TXViaNRhEugXpAZApviBqBnbTSKUgejnR9'],
    }),
  }
}