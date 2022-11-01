const { request, gql } = require('graphql-request');
const { getBlock } = require('../helper/getBlock');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { log } = require('../helper/utils')

const graphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
  polygon: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
  celo: "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
}

const blacklists = {
  ethereum: ['0xa850478adaace4c08fc61de44d8cf3b64f359bec', '0x055284a4ca6532ecc219ac06b577d540c686669d', '0x8c0411f2ad5470a66cb2e9c64536cfb8dcd54d51', '0x277667eb3e34f134adf870be9550e9f323d0dc24','0x4c83a7f819a5c37d64b4c5a2f8238ea082fa1f4e','0x290a6a7460b308ee3f19023d2d00de604bcf5b42','0x4b5ab61593a2401b1075b90c04cbcdd3f87ce011','0x582d23c7ec6b59afd041a522ff64ff081e8c0d2d','0x1f98431c8ad98523631ae4a59f267346ea31f984',],
  arbitrum: ['0xd4d2f4110878a33ea5b97f0665e518253446161a',],
  polygon: ['0x8d52c2d70a7c28a9daac2ff12ad9bfbf041cd318', '0x1f98431c8ad98523631ae4a59f267346ea31f984','0xd5302a8ead77b85ea3326b45f4714e0b3432b233','0xc951ab482ff11d8df636742e1f1c3fc8037427a9', ],
}

function v3TvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block })
    log('Fetching data for block: ',chain, block)
    const balances = {}
    const size = 1000
    let lastId = ''
    let pools
    let graphQueryPaged = gql`
    query poolQuery($lastId: String, $block: Int) {
      pools(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `

  if (chain === 'celo') // we dont care about block
    graphQueryPaged = gql`
    query poolQuery($lastId: String) {
      pools(first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
  
  // remove the bad pools
    const blacklisted = blacklists[chain] || []

    do {
      const res = await request(graphs[chain], graphQueryPaged, { lastId, block: block - 500 });
      pools = res.pools
      const tokensAndOwners = pools.map(i => ([[i.token0.id, i.id], [i.token1.id, i.id]])).flat()
      log(chain, block, lastId, pools.length)
      await sumTokens2({ balances, tokensAndOwners, chain, block, blacklistedTokens: blacklisted })
      lastId = pools[pools.length - 1].id
    } while (pools.length === size)

    return balances
  }
}

module.exports = {
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  misrepresentedTokens: true,
  timetravel: false,
  hallmarks: [
    [1598412107, "SushiSwap launch"],
    [1599535307, "SushiSwap migration"],
    [1600226507, "LM starts"],
    [1605583307, "LM ends"],
    [1617333707, "FEI launch"]
  ]
}

const chains = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'celo']
// const chains = ['celo']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: v3TvlPaged(chain)
  }
})