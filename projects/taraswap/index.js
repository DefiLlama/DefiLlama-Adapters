const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const graphUrls = {
  taraxa: 'https://indexer.lswap.app/subgraphs/name/taraxa/uniswap-v3'
}

const factoriesName = 'factories'
const tvlName = 'totalValueLockedUSD'

const v2graph = getChainTvl(graphUrls, factoriesName, tvlName)



module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'taraxa/uniswap-v3' subgraph`,
  taraxa: {
    tvl: v2graph('taraxa'),
  },
}
