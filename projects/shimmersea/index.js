const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const v2graph = getChainTvl({
  shimmer_evm: 'https://graph.shimmersea.finance/subgraphs/name/shimmersea/shimmer-dex'
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from subgraph`,
  shimmer_evm: {
    tvl: v2graph('shimmer_evm'),
  },
}
