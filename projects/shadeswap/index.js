const { post } = require("../helper/http")

async function tvl(api) {
  const { data: { pools } } = await post('https://prodv1.securesecrets.org/graphql', { "operationName": "getPools", "variables": { "ids": [] }, "query": "query getPools($ids: [String!]) {\n  pools(query: {ids: $ids}) {\n    id\n    contractAddress\n    codeHash\n    lpTokenId\n    lpTokenAmount\n    token0Id\n    token0Amount\n    token1Id\n    token1Amount\n    daoFee\n    lpFee\n    stakingContractAddress\n    stakingContractCodeHash\n    stakedLpTokenAmount\n    flags\n    isEnabled\n    liquidityUsd\n    volumeUsd\n    volumeChangePercent\n    StableParams {\n      id\n      priceRatio\n      alpha\n      gamma1\n      gamma2\n      minTradeSize0For1\n      minTradeSize1For0\n      maxPriceImpact\n      __typename\n    }\n    PoolToken {\n      rewardPerSecond\n      expirationDate\n      tokenId\n      __typename\n    }\n    __typename\n  }\n}" })
  return { tether: pools.map(i => i.liquidityUsd).filter(i => +i < 1e8).reduce((t, v) => t + v, 0) }
}


module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl
  }
}