const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Total Value Locked comprises of the sum of net liquidity at each pair of the Value Added eXchange (VAX), calculated using DefiLlamas native 'calculateusdUniTvl' module from SDK.",
  multivac: {
    tvl: getUniTVL({
      chain: 'multivac',
      factory: '0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD',
      useDefaultCoreAssets: true,
    })
  }
};