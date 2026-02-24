const { cachedGraphQuery } = require("../helper/cache");
const { addUniV3LikePosition } = require('../helper/unwrapLPs');

const chainConfigs =
{
  sonic: {
    subgraphUrl: "https://api.goldsky.com/api/public/project_cm58q8wq01kbk01ts09lc52kp/subgraphs/mz-subgraph/main/gn",
  },
}

const LiquidityRangesQuery = `query getLiquidities($lastId: String!) { 
  liquidityRanges(first:100 where: {and: [{id_gt: $lastId}, { liquidity_gt: "100" } ]}) { 
    id pool hook liquidity tickLower tickUpper
  }
}`

const slot0Abi =
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

async function tvl(api) {
  const config = chainConfigs[api.chain]

  const liquidityRanges = await cachedGraphQuery('marign-zero/tvl', config.subgraphUrl, LiquidityRangesQuery, {
    api,
    fetchById: true,
    useBlock: true,
  })

  const pools = Array.from(new Set(liquidityRanges.map(({ pool }) => pool.toLowerCase())))
  const poolIndexMap = {}
  pools.forEach((pool, index) =>     poolIndexMap[pool] = index)
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const slots = await api.multiCall({ abi: slot0Abi, calls: pools })

  for (const { liquidity, tickLower, tickUpper, pool } of liquidityRanges) {
    const idx = poolIndexMap[pool.toLowerCase()]

    addUniV3LikePosition({ api, token0: token0s[idx], token1: token1s[idx], tick: slots[idx].tick, liquidity, tickUpper, tickLower, })
  }

}

module.exports = {
  methodology: "TVL is calculated by summing the value of all tokens in Margin Zero liquidity positions across supported chains",
  doublecounted: true,
  sonic: {
    tvl,
  }
};
