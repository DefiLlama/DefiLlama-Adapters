const BigNumber = require('bignumber.js')
const { uniV3Export } = require('../helper/uniswapV3')

function mergeBalances(target, source = {}) {
  Object.entries(source).forEach(([token, amount]) => {
    target[token] = new BigNumber(target[token] || 0).plus(amount).toFixed(0)
  })
  return target
}

function sumTvls(...tvls) {
  return async (api) => {
    const balances = {}
    for (const tvl of tvls) mergeBalances(balances, await tvl(api))
    return balances
  }
}

const arbitrumLegacyCl = uniV3Export({
  arbitrum: { factory: '0xaa2cd7477c451e703f3b9ba5663334914763edf8', fromBlock: 90593047 },
}).arbitrum.tvl

const arbitrumRamsesXCl = uniV3Export({
  arbitrum: { factory: '0xd0019e86edB35E1fedaaB03aED5c3c60f115d28b', fromBlock: 420275312 },
}).arbitrum.tvl

module.exports = {
  arbitrum: {
    tvl: sumTvls(arbitrumLegacyCl, arbitrumRamsesXCl),
  },
  ...uniV3Export({
    hyperliquid: { factory: '0x07E60782535752be279929e2DFfDd136Db2e6b45', fromBlock: 18149975 },
    polygon: { factory: '0x2Bef16A0081565E72100D73CBe19B1Bd2d802380', fromBlock: 82177771 },
  }),
}
