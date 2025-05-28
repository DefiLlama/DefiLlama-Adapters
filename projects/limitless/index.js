const { nullAddress, addUniV3LikePosition } = require("../helper/unwrapLPs")
const { graphFetchById } = require('../helper/cache')
const { getUniqueAddresses } = require("../helper/utils")
const sdk = require('@defillama/sdk')

const config = {
  base: { postionManager: '0x6822063E39f1b8F40373402Ac96963B383877B3C', factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', limWETH: '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce', marginContract: '0x536801AaE40cb214c08f178c6727d7594a7c655b', graphEndpoint: 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-base/version/latest', dataProvider: '0x87E697c3EBe41eD707E4AD52541f19292Be81177', lmQuoter: '0xED14586763578147136e55D20a0Ee884Cd8fBC6d', },
  arbitrum: { postionManager: '0xf3B0362a5F210Fd826E74b3b10b269D4044085e5', factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', limWETH: '0x3a4F8E8512624226d2aC14fE496Bb9A4DdB73a9a', marginContract: '0x3611CD2B957514222a94C93e1A9a5be66b0b2841', graphEndpoint: 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-arbitrum/version/latest', dataProvider: '0x9139929dFbEeDfB03bbF8B59b4005BC631529b14', lmQuoter: '0x2E4a9Eb87375D518F4c4473a845D56AAbf1967FE', },
  linea: { postionManager: '0x726e3116AE07f43A7E1921c635352B75e2DEa4Ad', factory: '0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9', limWETH: '0x5188b47Cb80D1A3E22Cc6221792F199f1Fb0DD3c', },
}

const liquidityProvidedQuery = `
query($lastId: String, $block: Int) {
  liquidityProvideds(
    first:1000
    block: { number: $block }
    where: { id_gt: $lastId }
  ) {
  id
    pool
    recipient
    liquidity
    tickLower
    tickUpper
    blockTimestamp
  }
}
`

const liquidityWithdrawnQuery = `
query($lastId: String, $block: Int) {
  liquidityWithdrawns(
    first:1000
    block: { number: $block }
    where: { id_gt: $lastId }
  ) {
    id
    pool
    recipient
    liquidity
    tickLower
    tickUpper
    blockTimestamp
  }
}
`

Object.keys(config).forEach(chain => {
  const { postionManager, factory, limWETH, marginContract, graphEndpoint, } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      if (limWETH) {
        const token = await api.call({ abi: 'address:asset', target: limWETH })
        await api.sumTokens({ owner: limWETH, tokens: [token] })
      }
      const allTokens = []

      const getKey = (token0, token1, fee) => `${token0}-${token1}-${fee}`
      if (!graphEndpoint) {
        const tokenIds = await api.fetchList({ lengthAbi: 'totalSupply', itemAbi: abi.tokenByIndex, target: postionManager })
        const positionData = await api.multiCall({ calls: tokenIds, abi: abi.positions, target: postionManager })
        const poolData = {}
        positionData.forEach(({ token0, token1, tokensOwed0, tokensOwed1, fee, liquidity }) => {
          if (liquidity === 0) return;
          if (token0 === nullAddress && token1 === nullAddress) return;
          poolData[getKey(token0, token1, fee)] = { call: { params: [token0, token1, fee] } }
          if (marginContract) {
            allTokens.push(token0)
            allTokens.push(token1)
          }
          api.add(token0, tokensOwed0)
          api.add(token1, tokensOwed1)
        })
  
        // fetch tick info from uni v3 pools
        const calls = Object.values(poolData).map(i => i.call)
        const pools = await api.multiCall({ abi: abi.getPool, calls, target: factory })
        const ticks = await api.multiCall({ abi: abi.slot0, calls: pools, permitFailure: true })
        Object.values(poolData).forEach((data, i) => data.tick = ticks[i]?.tick)
  
        positionData.forEach(({ token0, token1, tickUpper, tickLower, fee, liquidity }) => {
          if (+liquidity === 0) return;
          const tick = poolData[getKey(token0, token1, fee)]?.tick
          if (!tick) console.log({ token0, token1, fee, tickUpper, tickLower, liquidity })
          if (!tick) return;  // pool not found
          addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })
        })

      } else {

        const provided = await graphFetchById({
          endpoint: graphEndpoint,
          query: liquidityProvidedQuery,
          api,
          options: {
            useBlock: true,
            safeBlockLimit: 500,
          }
        })
        const withdrawn = await graphFetchById({
          endpoint: graphEndpoint,
          query: liquidityWithdrawnQuery,
          api,
          options: {
            useBlock: true,
            safeBlockLimit: 500,
          }
        })
      
        const pools = getUniqueAddresses(provided.map(entry => entry.pool).concat(withdrawn.map(entry => entry.pool)))
        const token0s = await api.multiCall({  abi: 'address:token0', calls: pools})
        const token1s = await api.multiCall({  abi: 'address:token1', calls: pools})
        
        const ticks = await api.multiCall({ abi: abi.slot0, calls: pools, permitFailure: true })
      
        const poolMap = {}
        pools.forEach((pool, index) => {
          allTokens.push(token0s[index])
          allTokens.push(token1s[index])
          poolMap[pool] = {
            token0: token0s[index],
            token1: token1s[index],
            tick: ticks[index].tick
          }
        })
      
        const withdrawnBalancesApi = new sdk.ChainApi({ chain: api.chain})
      
        provided.forEach(({ pool, tickLower, tickUpper, liquidity }) => {
          const { token0, token1, tick } = poolMap[pool.toLowerCase()]
          addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })
        })
        withdrawn.forEach(({ pool, tickLower, tickUpper, liquidity }) => {
          const { token0, token1, tick } = poolMap[pool.toLowerCase()]
          addUniV3LikePosition({ api: withdrawnBalancesApi, token0, token1, tick, liquidity, tickUpper, tickLower, })
        })
        
        const balances = api.getBalancesV2()
        const withdrawnBalances = withdrawnBalancesApi.getBalancesV2()
        balances.subtract(withdrawnBalances)
      }
      if (marginContract) return api.sumTokens({ tokens: allTokens, owner: marginContract })
    }
  }
})


const abi = {
  "tokenByIndex": "function tokenByIndex(uint256 index) view returns (uint256)",
  "positions": "function positions(uint256 tokenId) view returns (address owner, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "totalSupply": "uint256:totalSupply",
  "getPool": "function getPool(address, address, uint24) view returns (address)",
  "slot0": "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
}