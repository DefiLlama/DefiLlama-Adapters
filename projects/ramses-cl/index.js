const sdk = require('@defillama/sdk')
const { uniV3Export } = require('../helper/uniswapV3')

const arbitrumLegacyCl = uniV3Export({
  arbitrum: { factory: '0xaa2cd7477c451e703f3b9ba5663334914763edf8', fromBlock: 90593047 },
}).arbitrum.tvl

const arbitrumRamsesXCl = uniV3Export({
  arbitrum: { factory: '0xd0019e86edB35E1fedaaB03aED5c3c60f115d28b', fromBlock: 420275312 },
}).arbitrum.tvl

module.exports = {
  arbitrum: {
    tvl: sdk.util.sumChainTvls([arbitrumLegacyCl, arbitrumRamsesXCl]),
  },
  ...uniV3Export({
    hyperliquid: { factory: '0x07E60782535752be279929e2DFfDd136Db2e6b45', fromBlock: 18149975 },
    polygon: { factory: '0x2Bef16A0081565E72100D73CBe19B1Bd2d802380', fromBlock: 82177771 },
  }),
}
