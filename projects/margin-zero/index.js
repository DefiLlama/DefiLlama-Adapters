const { cachedGraphQuery } = require("../helper/cache");
const { addUniV3LikePosition } = require('../helper/unwrapLPs');

const chainConfigs =
{
  sonic: {
    subgraphUrl: "https://api.goldsky.com/api/public/project_cm58q8wq01kbk01ts09lc52kp/subgraphs/mz-subgraph/main/gn",
  },
}

const LiquidityRangesQuery = `{ liquidityRanges(where: { liquidity_gt: "100" }) { pool hook handler liquidity tickLower tickUpper }}`

const slot0Abi =
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

const token0Abi =
  "function token0() view returns (address)";

const token1Abi =
  "function token1() view returns (address)";


async function getPoolData(api, pool) {
  const [token0, token1, tick] = await Promise.all([
    api.call({ abi: token0Abi, target: pool }),
    api.call({ abi: token1Abi, target: pool }),
    api.call({ abi: slot0Abi, target: pool }).then((res) => res[1])
  ])

  return {
    token0,
    token1,
    tick
  }
}

async function tvl(api) {
  const config = chainConfigs[api.chain]

  const liquidityRanges = await cachedGraphQuery('marign-zero/tvl', config.subgraphUrl, LiquidityRangesQuery, {
    api,
    fetchById: true,
    useBlock: true,
  })

  let poolsDataMap = {}
  const pools = Array.from(new Set(liquidityRanges.map(({ pool }) => pool)))

  // Fill pools data map
  await Promise.all(pools.map((pool) => getPoolData(api, pool).then((poolData) => {
    poolsDataMap[pool.toLowerCase()] = poolData
  })))


  for (const { liquidity, tickLower, tickUpper, pool } of liquidityRanges) {
    const token0 = poolsDataMap[pool.toLowerCase()]['token0'];
    const token1 = poolsDataMap[pool.toLowerCase()]['token1'];
    const tick = poolsDataMap[pool.toLowerCase()]['tick'];

    addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })

  }

}

module.exports = {
  methodology: "TVL is calculated by summing the value of all tokens in Margin Zero liquidity positions across supported chains",
  doublecounted: true,
  sonic: {
    tvl,
  }
};
