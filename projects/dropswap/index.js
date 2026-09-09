const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = '0xDCed5445409398dc609C2f87849B44bc9479664A'

const tvl = getUniTVL({
  factory: FACTORY,
  useDefaultCoreAssets: true,
})

module.exports = {
  methodology:
    'TVL is the value of tokens held in DropSwap V2 liquidity pools. Pools are discovered on-chain from the DropSwap V2 Factory using allPairsLength() and allPairs(uint256).',

  arbitrum: {
    tvl,
  },

  robinhood: {
    tvl,
  },
}
