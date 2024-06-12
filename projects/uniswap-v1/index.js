const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const v1graph = getChainTvl({
  ethereum: 'ESnjgAG9NjfmHypk4Huu4PVvz55fUwpyrRqHF21thoLJ'
}, "uniswaps", "totalLiquidityUSD")

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: v1graph("ethereum"),
  }
}
