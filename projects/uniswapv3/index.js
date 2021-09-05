const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-optimism-dev"
}
const chainTvl = getChainTvl(graphUrls, "factories", "totalValueLockedUSD")


module.exports = {
  misrepresentedTokens: true,
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