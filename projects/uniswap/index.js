const sdk = require('@defillama/sdk')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const { optimism } = require('../uniswapv3/index')
const { endpoints } = require('./api')

const v1graph = getChainTvl(
  {
    ethereum: endpoints.v1,
  },
  'uniswaps',
  'totalLiquidityUSD'
)

const v2graph = getChainTvl({
  ethereum: endpoints.v2,
})

const v3Graphs = getChainTvl(endpoints.v3, 'factories', 'totalValueLockedUSD')

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: sdk.util.sumChainTvls([v1graph('ethereum'), v2graph('ethereum'), v3Graphs('ethereum')]),
  },
  arbitrum: {
    tvl: v3Graphs('arbitrum'),
  },
  optimism,
  hallmarks: [
    [1598412107, 'SushiSwap launch'],
    [1599535307, 'SushiSwap migration'],
    [1600226507, 'LM starts'],
    [1605583307, 'LM ends'],
    [1617333707, 'FEI launch'],
  ],
}
