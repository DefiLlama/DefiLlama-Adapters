const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const MARKET_FACTORY = '0x5FF7f71cE54f21a678621D4992789482741afD8A'

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      owners: [MARKET_FACTORY],
      tokens: [ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDT],
    }),
  },
  methodology: 'TVL is the total USDC and USDT held in OraclBet prediction market smart contracts on Polygon, representing active market liquidity and open positions.',
}
