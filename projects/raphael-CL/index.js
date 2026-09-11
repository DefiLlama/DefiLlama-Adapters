const { getUniTVL } = require('../helper/unknownTokens.js')

// Raphael Exchange - Slipstream (concentrated liquidity) on Robinhood Chain
// https://docs.raphael.exchange/developers/contract-deployments
module.exports = {
  robinhood: {
    tvl: getUniTVL({
      factory: '0x5481864ddd46a2D798Df0925C23B7846e776E5E3',
      fetchBalances: true,
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint) view returns (address)',
      },
      permitFailure: true,
    })
  }
}
