const { gql, request } = require('graphql-request');

const endpoint = 'https://api.0xgraph.xyz/subgraphs/name/dopex-v2-clamm-public';
const abi = "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"

const query = gql`
  query strikes($limit: Int!, $skip: Int!) {
    strikes(
      first: $limit
      skip: $skip
      where: { totalLiquidity_gt: "100" }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      pool
      token0 {id}
      token1 {id}
      tickLower
      tickUpper
      totalLiquidity
    }
  }
`;

async function fetchStrikes(limit, skip, allData = []) {
  const variables = { limit, skip };
  const { strikes } = await request(endpoint, query, variables);
  allData.push(...strikes);

  if (strikes.length === limit) {
    return fetchStrikes(limit, skip + limit, allData);
  }

  return allData;
}

function addV3PositionBalances(strike, sqrtPricesMap) {
  const tickToPrice = (tick) => 1.0001 ** tick
  const token0 = strike.token0.id
  const token1 = strike.token1.id
  const liquidity = strike.totalLiquidity
  const bottomTick = +strike.tickLower
  const topTick = +strike.tickUpper
  const tick = +sqrtPricesMap[strike.pool.toLowerCase()].tick
  const sa = tickToPrice(bottomTick / 2)
  const sb = tickToPrice(topTick / 2)

  let amount0 = 0
  let amount1 = 0

  if (tick < bottomTick) {
    amount0 = liquidity * (sb - sa) / (sa * sb)
  } else if (tick < topTick) {
    const price = tickToPrice(tick)
    const sp = price ** 0.5

    amount0 = liquidity * (sb - sp) / (sp * sb)
    amount1 = liquidity * (sp - sa)
  } else {
    amount1 = liquidity * (sb - sa)
  }

  return { token0, amount0, token1, amount1 }
}

async function tvl(api) {
  const limit = 1000;
  const allData = await fetchStrikes(limit, 0);

  let pools = allData.map(strike => strike.pool.toLowerCase())
  pools = [...new Set(pools)]
  const sqrtPrices = await api.multiCall({ calls: pools, abi })
  const sqrtPricesMap = sqrtPrices.reduce((acc, item, i) => {
    return { ...acc, [pools[i]]: item, }
  }, {});

  allData.forEach((strike) => {
    const { token0, amount0, token1, amount1 } = addV3PositionBalances(strike, sqrtPricesMap);
    api.add(token0, amount0);
    api.add(token1, amount1);
  });
}

module.exports = {
  doublecounted: true,  // tokens are stored in UNI-V3 pools
  arbitrum: { tvl, },
};


