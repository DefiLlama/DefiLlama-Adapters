const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/complusnetwork/subgraph-ava',
  bsc: 'https://api.thegraph.com/subgraphs/name/complusnetwork/bsc-subgraph',
  polygon: 'https://api.thegraph.com/subgraphs/name/complusnetwork/subgraph-matic',
  heco: 'https://hg2.bitcv.net/subgraphs/name/complusnetwork/subgraph-heco'
}
const chainTvl = getChainTvl(graphUrls, "complusFactories")

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX, data comes from their subgraphs",
  /* outdated
  polygon: {
    tvl: chainTvl('polygon'),
  },
  bsc: {
    tvl: chainTvl('bsc'),
  },
  heco: {
    tvl: chainTvl('heco'),
  },
  */
  avalanche: {
    tvl: chainTvl('avax'),
  },
  tvl: sdk.util.sumChainTvls(['avax'].map(chainTvl))
}