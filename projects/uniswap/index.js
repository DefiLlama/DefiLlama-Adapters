const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')
const {optimism, ethereum:v3Ethereum} = require('./v3/index')
const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');

const v1graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
}, "uniswaps", "totalLiquidityUSD")


const v2graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2'
})

const v3Graphs = getChainTvl({
  ethereum: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
  polygon: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
}, "factories", "totalValueLockedUSD", 500)

const graphUrl = 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo';
const graphQuery = gql`
query uniswapFactories {  
  factories(first: 1, subgraphError: allow) {  
    totalValueLockedUSD
  }
}
`;

async function celotvl(timestamp, block) {
   const { factories } = await request(graphUrl, graphQuery);
   const usdTvl = Number(factories[0].totalValueLockedUSD);
   return toUSDTBalances(usdTvl);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum:{
    tvl: sdk.util.sumChainTvls([v1graph("ethereum"), v2graph('ethereum'), v3Graphs('ethereum')]),
  },
  arbitrum:{
    tvl: v3Graphs('arbitrum')
  },
  polygon:{
    tvl: v3Graphs('polygon')
  },
  optimism: {
    tvl: v3Graphs('optimism')
  },
  celo: {
    tvl: celotvl
  },
  hallmarks:[
    [1598412107, "SushiSwap launch"],
    [1599535307, "SushiSwap migration"],
    [1600226507, "LM starts"],
    [1605583307, "LM ends"],
    [1617333707, "FEI launch"]
  ]
}