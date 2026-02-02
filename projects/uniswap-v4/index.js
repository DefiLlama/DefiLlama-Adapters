const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');
const { nullAddress } = require("../helper/tokenMapping");
const { getEnv } = require("../helper/env");
const { cachedGraphQuery } = require("../helper/cache");

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  ethereum: { factory: "0x000000000004444c5dc75cB358380D2e3dE08A90", fromBlock: 21688329, blacklistedTokens: ['0xb4357054c3da8d46ed642383f03139ac7f090343'] },
  optimism: { factory: "0x9a13f98cb987694c9f086b1f5eb990eea8264ec3", fromBlock: 130947675 },
  base: { factory: "0x498581ff718922c3f8e6a244956af099b2652b2b", fromBlock: 25350988 },
  arbitrum: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 297842872, blacklistedTokens: ['0x1a6b3a62391eccaaa992ade44cd4afe6bec8cff1', '0x3e4ffeb394b371aaaa0998488046ca19d870d9ba'] },
  polygon: { factory: "0x67366782805870060151383f4bbff9dab53e5cd6", fromBlock: 66980384 },
  blast: { factory: "0x1631559198a9e474033433b2958dabc135ab6446", fromBlock: 14377311 },
  zora: { factory: "0x0575338e4c17006ae181b47900a84404247ca30f", fromBlock: 25434534 },
  wc: { factory: "0xb1860d529182ac3bc1f51fa2abd56662b7d13f33", fromBlock: 9111872 },
  ink: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 4580556 },
  soneium: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 2473300 },
  avax: { factory: "0x06380c0e0912312b5150364b9dc4542ba0dbbc85", fromBlock: 56195376 },
  bsc: { factory: "0x28e2ea090877bf75740558f6bfb36a5ffee9e9df", fromBlock: 45970610, blacklistedTokens: ['0xb4357054c3dA8D46eD642383F03139aC7f090343'] },
  unichain: { factory: "0x1F98400000000000000000000000000000000004", fromBlock: 1 },
  monad: { factory: "0x188d586ddcf52439676ca21a244753fa19f9ea8e", fromBlock: 29255895 },
}
const subgraphs = {
  xlayer: {endpoint: '2fc6nFafrPs4xybzHMnmD48qgUYoHTizhDk1mCJJUDjD', factory: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32' }
}

function processResult(api, results, factory, blacklistedTokens = []) {
    const tokenSet = new Set()
    const ownerTokens = []
    results.forEach(pool => {
      tokenSet.add(pool.token0)
      tokenSet.add(pool.token1)
      if (pool.hooks !== nullAddress) {
        ownerTokens.push([[pool.token0, pool.token1], pool.hooks])
      }
    })
    ownerTokens.push([Array.from(tokenSet), factory])
    return sumTokens2({ api, ownerTokens, permitFailure: true, sumChunkSize: 10000, sumChunkSleep: 5000, blacklistedTokens: blacklistedTokens })
}

Object.keys(subgraphs).forEach(chain => {
  const { endpoint, factory } = subgraphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!getEnv('IS_RUN_FROM_CUSTOM_JOB')) throw new Error('This job is not meant to be run directly, please use the custom job feature')
      const query = `{
        query poolQuery($lastId: String, $block: Int) {
          pools(block: { number: $block} first: 1000 where: {id_gt: $lastId totalValueLockedUSD_gt: 100}   subgraphError: allow) {
            token0 {
              id
            }
            token1 {
              id
            }
            hooks
          }
        }
      }`
      const result = await cachedGraphQuery(`uniswap-v4/${chain}`, endpoint, query, { api, fetchById: true })
      const mappedResults = result.pools.map(pool => { return { token0: pool.token0.id, token1: pool.token1.id, hooks: pool.hooks}})
      return processResult(api, mappedResults, factory, subgraphs[chain].blacklistedTokens)
    }
  }
})

const eventAbi = "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)"

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!getEnv('IS_RUN_FROM_CUSTOM_JOB')) throw new Error('This job is not meant to be run directly, please use the custom job feature')

      let compressType
      if (chain === 'base') compressType = 'v1'
      const logs = await getLogs2({ api, factory, eventAbi, fromBlock, compressType,})
      const mappedLogs = logs.map(log => { return { token0: log.currency0, token1: log.currency1, hooks: log.hooks}})
      return processResult(api, mappedLogs, factory, config[chain].blacklistedTokens)
    }
  }
})

module.exports.isHeavyProtocol = true;