const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')
// const {optimism, ethereum:v3Ethereum} = require('./v3/index')
const { request, gql } = require('graphql-request');
const { toUSDTBalances } = require('../helper/balances');
const { log } = require('../helper/utils');

const v1graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap'
}, "uniswaps", "totalLiquidityUSD")


const v2graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2'
})

const v3Graphs = getChainTvl({
  // ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
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

async function v3EthTvl(_, block) {
  const size = 1000
  let sum = 0
  let lastId = ''
  let pools
  // remove the bad pools
  const blacklisted = ['0xa850478adaace4c08fc61de44d8cf3b64f359bec']

  const graphQuery = gql`
    query poolQuery($lastId: String) {
      pools(first:${size} where: {id_gt: $lastId}) {
        id
        totalValueLockedUSD
      }
    }
  `

  do {
    const res = await request('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', graphQuery, { lastId });
    pools = res.pools
    pools.forEach(i => {
      if (blacklisted.includes(i.id)) return;
      sum+= +i.totalValueLockedUSD
    })

    // log(lastId, pools.length)
    lastId = pools[pools.length - 1].id
  } while (pools.length === size)

  return { tether: sum }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: sdk.util.sumChainTvls([v1graph("ethereum"), v2graph('ethereum'), v3EthTvl]),
  },
  arbitrum: {
    tvl: v3Graphs('arbitrum')
  },
  polygon: {
    tvl: v3Graphs('polygon')
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
