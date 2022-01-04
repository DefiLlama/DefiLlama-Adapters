const { getAvaxUniswapTvl } = require("../helper/getUniSubgraphTvl")

const tvl = getAvaxUniswapTvl('https://api.thegraph.com/subgraphs/name/canarydeveloper/canarydex', 'canaryFactories')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs. We get that information from the "canarydeveloper/canarydex" subgraph',
  avalanche:{
    tvl,
  },
  tvl
}