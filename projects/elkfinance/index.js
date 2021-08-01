const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/elkfinance/elkdex-avax',
  fantom: 'https://api.thegraph.com/subgraphs/name/elkfinance/elkdex-ftm',
  polygon: 'https://api.thegraph.com/subgraphs/name/elkfinance/elkdex-matic',
}
const chainTvl = getChainTvl(graphUrls, "elkFactories")

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl('polygon'),
  },
  fantom: {
    tvl: chainTvl('fantom'),
  },
  avalanche: {
    tvl: chainTvl('avax'),
  },
  tvl: sdk.util.sumChainTvls(['polygon', 'avax', 'fantom'].map(chainTvl))
}