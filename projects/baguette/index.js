const { getAvaxUniswapTvl } = require("../helper/getUniSubgraphTvl")

const tvl = getAvaxUniswapTvl('https://api.thegraph.com/subgraphs/name/baguette-exchange/baguette', 'baguetteFactories')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs. We get that information from the "baguette-exchange/baguette" subgraph',
  avalanche:{
    tvl,
  },
  tvl
}