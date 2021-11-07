const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

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
    tvl: sdk.util.sumChainTvls([v3Graphs('ethereum'), v2graph('ethereum')]),
  },
  arbitrum:{
    tvl: v3Graphs('arbitrum')
  },
  optimism:{
    tvl: v3Graphs('optimism')
  },
}