const { uniV3Export } = require('../helper/uniswapV3')
const { cachedGraphQuery, configPost } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const graphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  optimism: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  arbitrum: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
  polygon: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
  celo: "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
  bsc: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax",
  base: "https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest",
}

const blacklists = {
  base: ['0xb17d69c91135516b0256c67e8bd32cd238b56161'],
  ethereum: ['0xa850478adaace4c08fc61de44d8cf3b64f359bec', '0x055284a4ca6532ecc219ac06b577d540c686669d', '0x8c0411f2ad5470a66cb2e9c64536cfb8dcd54d51', '0x277667eb3e34f134adf870be9550e9f323d0dc24', '0x4c83a7f819a5c37d64b4c5a2f8238ea082fa1f4e', '0x290a6a7460b308ee3f19023d2d00de604bcf5b42', '0x4b5ab61593a2401b1075b90c04cbcdd3f87ce011', '0x582d23c7ec6b59afd041a522ff64ff081e8c0d2d', '0x1f98431c8ad98523631ae4a59f267346ea31f984', '0xaf44e10ed87d90f28bff2d1fbef1f64b090f5ebb', '0xdfef6416ea3e6ce587ed42aa7cb2e586362cbbfa', '0x7e9c15c43f0d6c4a12e6bdff7c7d55d0f80e3e23', '0x1111111becab3c8866712ebf23fc4741010b8dce', '0x77777777b79f2fa437bf526169f98aa0c884c4b7', '0x630d98424efe0ea27fb1b3ab7741907dffeaad78'],
  arbitrum: ['0xd4d2f4110878a33ea5b97f0665e518253446161a', '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1',],
  polygon: ['0x8d52c2d70a7c28a9daac2ff12ad9bfbf041cd318', '0x1f98431c8ad98523631ae4a59f267346ea31f984', '0xd5302a8ead77b85ea3326b45f4714e0b3432b233', '0xc951ab482ff11d8df636742e1f1c3fc8037427a9',],
}

function v3TvlPaged(chain) {
  return async (api) => {
    const block = await api.getBlock()

    let graphQueryPaged = `
    query poolQuery($lastId: String, $block: Int) {
      pools(block: { number: $block } first:1000 where: {id_gt: $lastId totalValueLockedUSD_gt: 100}   subgraphError: allow) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `

    const pools = await cachedGraphQuery('uniswap-v3/' + api.chain, graphs[chain], graphQueryPaged, { variables: { block: block - 500 }, fetchById: true })
    const blacklistedTokens = blacklists[chain] || []

    const tokensAndOwners = pools.map(i => ([[i.token0.id, i.id], [i.token1.id, i.id]])).flat()
    return sumTokens2({ api, tokensAndOwners, blacklistedTokens, permitFailure: true })
  }
}

async function filecoinTvl(api) {
  const { result: { pools } } = await configPost('oku-trade/filecoin', 'https://cush.apiary.software/filecoin', {
    "jsonrpc": "2.0",
    "method": "cush_topPools",
    "params": [
      {
        "result_size": 1000,
        "sort_by": "tx_count",
        "sort_order": false
      }
    ],
    "id": 0
  })
  const ownerTokens = pools.map(i => [[i.t0, i.t1], i.address])
  return api.sumTokens({ ownerTokens })
}


module.exports = {
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  timetravel: false,
  hallmarks: [
    [1588610042, "UNI V2 Launch"],
    [1598412107, "SushiSwap launch"],
    [1599535307, "SushiSwap migration"],
    [1600226507, "LM starts"],
    [1605583307, "LM ends"],
    [1617333707, "FEI launch"],
    [1620156420, "UNI V3 Launch"]
  ],
  ...uniV3Export({
    // base: { factory: '0x33128a8fc17869897dce68ed026d694621f6fdfd', fromBlock: 1371680, blacklistedTokens: blacklists.base },
    celo: { factory: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc', fromBlock: 13916355, },
    moonbeam: { factory: '0x28f1158795a3585caaa3cd6469cd65382b89bb70', fromBlock: 4313505 },
    era: { factory: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422', fromBlock: 12637080 },
    boba: { factory: "0xFFCd7Aed9C627E82A765c3247d562239507f6f1B", fromBlock: 969351, },
    rsk: { factory: "0xAf37Ec98A00fD63689cF3060Bf3b6784e00CaD82", fromBlock: 5829207, },
    scroll: { factory: "0x70C62C8b8e801124A4Aa81ce07b637A3e83cb919", fromBlock: 1367, },
    blast: { factory: "0x792edade80af5fc680d96a2ed80a44247d2cf6fd", fromBlock: 400903, },
    linea: { factory: "0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9", fromBlock: 25247, },
  }),
  filecoin: { tvl: filecoinTvl },
}

const chains = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'bsc', 'avax', 'base']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: v3TvlPaged(chain)
  }
})
