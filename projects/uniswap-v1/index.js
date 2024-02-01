const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const v1graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
}, "uniswaps", "totalLiquidityUSD")

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: v1graph("ethereum"),
  }
}
