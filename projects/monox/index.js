const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  hallmarks: [
    [1669766400, "swap contract exploit"]
  ],
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x59653E37F8c491C3Be36e5DD4D503Ca32B5ab2f4', tokens: [
        "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
        "0x92e187a03b6cd19cb6af293ba17f2745fd2357d5",
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC
      ]
    })
  },
  polygon: {
    tvl: sumTokensExport({
      owner: '0x3826367A5563eCE9C164eFf9701146d96cC70AD9', tokens: [
        ADDRESSES.polygon.WBTC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.WMATIC_2,
      ]
    })
  }
}