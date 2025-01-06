const { cachedGraphQuery } = require("../helper/cache");

const chainConfig = {
  146: {
    chainName: "sonic",
    subgraph: "https://api.goldsky.com/api/public/project_cm58q8wq01kbk01ts09lc52kp/subgraphs/mz-subgraph/main/gn"
  },
}

function LiquidityRangesQuery(first, skip) {
  return `{ liquidityRanges(first: ${first}, skip: ${skip}) {pool liquidity tickLower tickUpper }}`
}

const slot0Abi =
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

const token0Abi =
  "function token0() view returns (address)";

const token1Abi =
  "function token1() view returns (address)";


function unwrapLiquidity(tickLower, tickUpper, currTick, liquidity) {
  const tickToPrice = (tick) => 1.0001 ** tick;
  const bottomTick = +tickLower;
  const topTick = +tickUpper;
  const tick = +currTick;
  const sa = tickToPrice(bottomTick / 2);
  const sb = tickToPrice(topTick / 2);

  let amount0 = 0;
  let amount1 = 0;

  if (tick < bottomTick) {
    amount0 = (liquidity * (sb - sa)) / (sa * sb);
  } else if (tick < topTick) {
    const price = tickToPrice(tick);
    const sp = price ** 0.5;

    amount0 = (liquidity * (sb - sp)) / (sp * sb);
    amount1 = liquidity * (sp - sa);
  } else {
    amount1 = liquidity * (sb - sa);
  }

  return { amount0, amount1 };
}


async function getPoolTokens(api, pool, chainName) {
  const [token0, token1] = await Promise.all([
    api.call({ abi: token0Abi, target: pool }),
    api.call({ abi: token1Abi, target: pool })
  ])

  return {
    token0,
    token1
  }
}


async function tvl(api) {
  const config = chainConfig[api.api.chainId]
  const subgraphUrl = config.subgraph
  const chainName = config.chainName

  let cummulativeLiquidityRanges = []

  let counter = 0;
  while (true) {
    const { liquidityRanges } = await cachedGraphQuery('marign-zero/tvl', subgraphUrl, LiquidityRangesQuery(1000, 1000 * counter))
    cummulativeLiquidityRanges = [...cummulativeLiquidityRanges, ...liquidityRanges]
    counter++;

    if (liquidityRanges.length < 1000) {
      break;
    }
  }

  let pools = new Set(cummulativeLiquidityRanges.map(({ pool }) => pool.toLowerCase()))

  pools = [...new Set(pools)];

  for await (const pool of pools) {
    const currTick = (await api.api.call({ abi: slot0Abi, target: pool }))['tick']
    const { token0, token1 } = await getPoolTokens(api.api, pool, chainName)
    const poolLiquidityRanges = cummulativeLiquidityRanges.filter(({ pool: rangePool }) => rangePool.toLowerCase() === pool.toLowerCase())

    for (const { tickLower, tickUpper, liquidity } of poolLiquidityRanges) {
      const { amount0, amount1 } = unwrapLiquidity(tickLower, tickUpper, currTick, liquidity)
      api.add(token0, amount0)
      api.add(token1, amount1)
    }
  }
}



module.exports = {
  methodology: "TVL is calculated by summing the value of all tokens in Margin Zero liquidity positions across supported chains",
  doublecounted: true,
  sonic: {
    tvl,
  }
};
