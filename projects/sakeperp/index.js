const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/therealsakeswap/sakeswap-subgraph-v2',
}
const chainTvl = getChainTvl(graphUrls)

module.exports = {
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX, data comes from their subgraph",
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  tvl: sdk.util.sumChainTvls(['ethereum'].map(chainTvl))
}