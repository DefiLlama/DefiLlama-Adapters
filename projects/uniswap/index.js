const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')
const {optimism} = require('../uniswapv3/index')

const v1graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
}, "uniswaps", "totalLiquidityUSD")


const v2graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2'
})

const v3Graphs = getChainTvl({
  ethereum: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-optimism-dev",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
}, "factories", "totalValueLockedUSD")

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum:{
    tvl: sdk.util.sumChainTvls([v1graph("ethereum"), v2graph('ethereum'), v3Graphs('ethereum')]),
  },
  arbitrum:{
    tvl: v3Graphs('arbitrum')
  },
  optimism,
  hallmarks:[
    [1598412107, "SushiSwap launch"],
    [1596856907, "SushiSwap migration"],
    [1600226507, "LM starts"],
    [1605583307, "LM ends"],
    [1617333707, "FEI launch"]
  ]
}
