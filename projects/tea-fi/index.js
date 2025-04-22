const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  polygon: {
    owners: [
      '0x1fc39644c58396e567aa44840cf5e5c9696a9a1c',
    ],
    tokens: [
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WETH_1,
      ADDRESSES.polygon.WBTC,
      ADDRESSES.polygon.WSOL,
    ]
  },
  ethereum: {
    owners: [
      '0x23Ca477089466Ac4D563a89E4F0df8C46B92735d',
    ],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.POL,
      ADDRESSES.ethereum.WSOL,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.WETH,
    ]
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain], })
  }
})

module.exports.methodology = "Value of tokens locked in the teams safe contracts"