const { nullAddress, addUniV3LikePosition } = require("../helper/unwrapLPs")

const config = {
  base: { postionManager: '0x3eF54A2Cf152f6E06C0928722412883D448F92eC', factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', limWETH: '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce', },
  arbitrum: { postionManager: '0x6D73fc6F4C299E369377C0e60CebFef2409f86A0', factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', limWETH: '0xdEe4326E0a8B5eF94E50a457F7c70d4821be9f4C', },
  linea: { postionManager: '0x726e3116AE07f43A7E1921c635352B75e2DEa4Ad', factory: '0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9', limWETH: '0x5188b47Cb80D1A3E22Cc6221792F199f1Fb0DD3c', },
}

Object.keys(config).forEach(chain => {
  const { postionManager, factory, limWETH } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      if (limWETH) {
        const token = await api.call({  abi: 'address:asset', target: limWETH })
        await api.sumTokens({ owner: limWETH, tokens: [token]})
      }

      const getKey = (token0, token1, fee) => `${token0}-${token1}-${fee}`

      const positionData = await api.fetchList({ lengthAbi: 'totalSupply', itemAbi: abi.positions, target: postionManager })
      const poolData = {}
      // console.table(positionData.map(({ token0, token1, tokensOwed0, tokensOwed1, fee, liquidity }) => ({ token0, token1, tokensOwed0, tokensOwed1, fee, liquidity })))
      positionData.forEach(({ token0, token1, tokensOwed0, tokensOwed1, fee, liquidity }) => {
        if (liquidity === 0) return;
        if (token0 === nullAddress && token1 === nullAddress) return;
        poolData[getKey(token0, token1, fee)] = { call: { params: [token0, token1, fee] } }
        api.add(token0, tokensOwed0)
        api.add(token1, tokensOwed1)
      })

      // fetch tick info from uni v3 pools
      const calls = Object.values(poolData).map(i => i.call)
      const pools = await api.multiCall({ abi: abi.getPool, calls, target: factory })
      const ticks = await api.multiCall({ abi: abi.slot0, calls: pools, permitFailure: true })
      Object.values(poolData).forEach((data, i) => data.tick = ticks[i]?.tick)

      positionData.forEach(({ token0, token1, tickUpper, tickLower, fee, liquidity }) => {
        if (liquidity === 0) return;
        const tick = poolData[getKey(token0, token1, fee)]?.tick
        if (!tick) return;  // pool not found
        addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })
      })
    }
  }
})

const abi = {
  "positions": "function positions(uint256 tokenId) view returns (address owner, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "totalSupply": "uint256:totalSupply",
  "getPool": "function getPool(address, address, uint24) view returns (address)",
  "slot0": "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
}