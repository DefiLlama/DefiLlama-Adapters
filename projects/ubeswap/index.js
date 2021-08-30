const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  celo: 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap',
}
const chainTvl = getChainTvl(graphUrls, "ubeswapFactories")

module.exports = {
  misrepresentedTokens: true,
  tvl: chainTvl('celo')
}