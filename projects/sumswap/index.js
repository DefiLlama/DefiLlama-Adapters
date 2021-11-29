const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const chainTvl = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/sumswap/sumswap',
}, "sumswapFactories")

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  methodology:
    "TVL is equal to the liquidity on the AMM.",
}