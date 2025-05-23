const { getLogs2 } = require('../helper/cache/getLogs')
const { cachedGraphQuery } = require("../helper/cache");
const { addUniV3LikePosition } = require('../helper/unwrapLPs');
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const FACTORY = '0x0000000000000CF008e9bf9D01f8306029724c80'

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
    panopticPool {
      id
    }
  }
}`

const abi = {"PoolDeployed": "event PoolDeployed(address indexed poolAddress, address indexed oracleContract, bytes32 indexed idV4, address collateralTracker0, address collateralTracker1)"}

const config = {
  ethereum: {
    graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-mainnet/prod/gn',
    startBlock: 21745246,
    safeBlockLimit: 50,
    PoolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90'
  },
  base: {
    graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-base/prod/gn',
    startBlock: 29281023,
    safeBlockLimit: 50,
    PoolManager: '0x498581ff718922c3f8e6a244956af099b2652b2b'
  },
//   unichain: {
//     graphUrl: 'https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-unichain/prod/gn',
//     startBlock: 8576605,
//     safeBlockLimit: 50,
//     PoolManager: '0x1f98400000000000000000000000000000000004'
//   }
}


async function tvl(api) {
  const chain = api.chain
  const { startBlock, graphUrl, safeBlockLimit, PoolManager } = config[chain]

  const poolDeployedLogs = await getLogs2({ api, target: FACTORY, fromBlock: startBlock, eventAbi: abi.PoolDeployed, })

  const isV4 = {}

  for (const poolDeployedLog of poolDeployedLogs) {
    // get underlying token from each collateral tracker
    const tokens = await api.multiCall({ abi:'function asset() external view returns (address)', calls: [{target: poolDeployedLog.collateralTracker0, params: []}, {target: poolDeployedLog.collateralTracker1, params: []}] })
    
    // query the erc1155 balance of the pool manager for each token
    const balancesRaw = await api.multiCall({ abi:'function balanceOf(address owner, uint256 id) view returns (uint256)', calls: tokens.map(t => ({ target: PoolManager, params: [poolDeployedLog.poolAddress, t] })) })
    
    isV4[poolDeployedLog.poolAddress.toLowerCase()] = true

    api.addTokens(tokens, balancesRaw)
  }


  const chunks = await cachedGraphQuery(`panoptic/sfpm-chunks`, graphUrl, SFPMChunksQuery, { api, useBlock: true, fetchById: true, safeBlockLimit, })
  chunks.forEach(chunk => {
    if (!isV4[chunk.panopticPool.id.toLowerCase()]) return
    addUniV3LikePosition({ api, token0: chunk.pool.token0.id, token1: chunk.pool.token1.id, tick: chunk.pool.tick, liquidity: chunk.netLiquidity, tickUpper: chunk.tickUpper, tickLower: chunk.tickLower, })
  })
}

module.exports = {
  ethereum: {
    tvl,
    methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
    start: 1738292183,
  },
  base: {
    tvl,
    methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
    start: 1745308193,
  },
//   unichain: {
//     tvl,
//     methodology: 'This adapter counts tokens held by all PanopticPool contracts created by the PanopticFactory, as well as the token composition of all Uniswap liquidity held by the SemiFungiblePositionManager (which is used by every PanopticPool to manage liquidity).',
//     start: ,
//   },
}