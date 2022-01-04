const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const graphUrls = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/gavlomas/yapeswap-t2',
}
const chainTvl = getChainTvl(graphUrls, "yapeswapFactories")

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  tvl: chainTvl('ethereum'),
}