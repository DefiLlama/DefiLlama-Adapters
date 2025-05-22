const { getLogs2 } = require('../helper/cache/getLogs')
const { cachedGraphQuery } = require("../helper/cache");
const { addUniV3LikePosition } = require('../helper/unwrapLPs');

const FACTORY = '0x000000000000010a1DEc6c46371A28A071F8bb01'
const SFPM = '0x0000000000000DEdEDdD16227aA3D836C5753194'


const SFPMChunksQuery = `
query SFPMChunks($lastId: ID, $block: Int) {
  chunks(first: 1000 
    block: {number: $block}
    where: {and: [{id_gt: $lastId}, { netLiquidity_gt: 100}]}
    ) {
    netLiquidity
    tickLower
    tickUpper
    id
    pool {      id, tick, token0 {id}, token1 {id}}
  }
}`

const abi = {
  "PoolDeployed": "event PoolDeployed(address indexed poolAddress, address indexed uniswapPool, address collateralTracker0, address collateralTracker1)",
  "PoolInitialized": "event PoolInitialized(address indexed uniswapPool, uint64 poolId, int24 minEnforcedTick, int24 maxEnforcedTick)",
}

const config = {
  ethereum: {
    graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-mainnet/prod/gn',
    startBlock: 21389983,
    safeBlockLimit: 50
  },
  base: {
    graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-base/prod/gn',
    startBlock: 29279670,
    safeBlockLimit: 50
  },
  unichain: {
    graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-unichain/prod/gn',
    startBlock: 8576605,
    safeBlockLimit: 50
  }
}


async function tvl(api) {
  const chain = api.chain
  const { startBlock, graphUrl, safeBlockLimit } = config[chain]

  const poolDeployedLogs = await getLogs2({ api, target: FACTORY, fromBlock: startBlock, eventAbi: abi.PoolDeployed, })

  const isV4 = {}
  const ownerTokens = []
  poolDeployedLogs.forEach((poolDeployedLog, i) => {
    // to compte tokens locked in panoptic pools
    ownerTokens.push([[token0s[i], token1s[i]], poolDeployedLogs[i].poolAddress])

    // to compute value locked in uni v3 pools
    isV4[poolDeployedLog.poolAddress] = true
  })

  await api.sumTokens({ ownerTokens })

  const chunks = await cachedGraphQuery(`panoptic/sfpm-chunks`, graphUrl, SFPMChunksQuery, { api, useBlock: true, fetchById: true, safeBlockLimit, })
  chunks.forEach(chunk => {
    if (!isV4[chunk.pool.id.toLowerCase()]) return
    addUniV3LikePosition({ api, token0: chunk.pool.token0.id, token1: chunk.pool.token1.id, tick: chunk.pool.tick, liquidity: chunk.netLiquidity, tickUpper: chunk.tickUpper, tickLower: chunk.tickLower, })
  })
}

module.exports = {
  ethereum: {
    tvl,
    methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
    start: 1734049991,
  },
  base: {
    tvl,
    methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
    start: 1745348687,
  },
  unichain: {
    tvl,
    methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
    start: 1739411364,
  },
}