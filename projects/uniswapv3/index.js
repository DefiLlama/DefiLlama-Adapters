const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-alt',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one',
  optimism: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-optimism',
}
const chainTvl = getChainTvl(graphUrls, "factories", "totalValueLockedUSD")

module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  optimism: {
    tvl: chainTvl('optimism'),
  },
  /*
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
  */
  tvl: sdk.util.sumChainTvls(['ethereum', 'optimism'].map(chainTvl))
}