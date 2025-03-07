const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  polygon: {
    owners: [
      '0x1fc39644c58396e567aa44840cf5e5c9696a9a1c',
    ],
    tokens: [
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WETH,
      ADDRESSES.polygon.WBTC,
    ]
  },
  ethereum: {
    owners: [
      '0x7df4253cf5cf81f7ca7fa5f37e54bc3543a528fb',
    ],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      '0xa8c8861b5ccf8cce0ade6811cd2a7a7d3222b0b8',
      '0x84d17ef6bec165484c320b852eeb294203e191be',
    ]
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain], })
  }
})

module.exports.methodology = "Value of tokens locked in the teams safe contracts"