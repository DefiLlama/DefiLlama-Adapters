const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')
// const {optimism, ethereum:v3Ethereum} = require('./v3/index')
const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');
const { log } = require('../helper/utils');
const { default: BigNumber } = require('bignumber.js');

const v1graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
}, "uniswaps", "totalLiquidityUSD")


const v2graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2'
})

const graphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
  polygon: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
}

const blacklists = {
  ethereum: ['0xa850478adaace4c08fc61de44d8cf3b64f359bec', '0x055284a4ca6532ecc219ac06b577d540c686669d', '0x8c0411f2ad5470a66cb2e9c64536cfb8dcd54d51', '0x277667eb3e34f134adf870be9550e9f323d0dc24'],
  arbitrum: ['0xd4d2f4110878a33ea5b97f0665e518253446161a',],
  polygon: ['0x8d52c2d70a7c28a9daac2ff12ad9bfbf041cd318',],
}

const v3Graphs = getChainTvl({
  optimism: graphs.optimism,
}, "factories", "totalValueLockedUSD", 500)

const graphUrl = 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo';
const graphQuery = gql`
query uniswapFactories($block: Int) {  
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

function v3TvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    const balances = {}
    const transform = i => `${chain}:${i}` 
    block -= 50
    const size = 1000
    let sum = 0
    let lastId = ''
    let pools
    const graphQueryPaged = gql`
    query poolQuery($lastId: String, $block: Int) {
      tokens(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        totalValueLocked
        totalValueLockedUSD
        symbol
        name
        decimals
      }
    }
  `// remove the bad pools
    const blacklisted = blacklists[chain] || []

    do {
      const res = await request(graphs[chain], graphQueryPaged, { lastId, block });
      pools = res.tokens
      console.log(chain, pools.length)
      pools.forEach(i => {
        if (blacklisted.includes(i.id)) return;
        sdk.util.sumSingleBalance(balances, transform(i.id), BigNumber(i.totalValueLocked * (10 ** i.decimals)).toFixed(0))
      })

      // log(lastId, pools.length)
      lastId = pools[pools.length - 1].id
    } while (pools.length === size)

    return balances
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: sdk.util.sumChainTvls([v1graph("ethereum"), v2graph('ethereum'), v3TvlPaged('ethereum')]),
  },
  arbitrum: {
    tvl: v3TvlPaged('arbitrum')
  },
  polygon: {
    tvl: v3TvlPaged('polygon')
  },
  optimism: {
    tvl: v3Graphs('optimism')
  },
  celo: {
    tvl: celotvl
  },
  hallmarks: [
    [1598412107, "SushiSwap launch"],
    [1599535307, "SushiSwap migration"],
    [1600226507, "LM starts"],
    [1605583307, "LM ends"],
    [1617333707, "FEI launch"]
  ]
}
