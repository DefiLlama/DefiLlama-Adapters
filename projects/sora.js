const { post } = require('./helper/http')

async function tvl(api) {
  const { data: { data: { edges } } } = await post('https://api.subquery.network/sq/sora-xor/sora-prod', { "operationName": "SubqueryPoolsQuery", "query": "query SubqueryPoolsQuery($after: Cursor, $filter: PoolXYKFilter) {\n  data: poolXYKs(after: $after, filter: $filter) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    edges {\n      node {\n        baseAssetId\n        targetAssetId\n        baseAssetReserves\n        targetAssetReserves\n        priceUSD\n        liquidityUSD\n        strategicBonusApy\n      }\n    }\n  }\n}", "variables": { "after": "", "filter": { "baseAssetReserves": { "greaterThan": "0" }, "targetAssetId": { "in": ["0x0200000000000000000000000000000000000000000000000000000000000000", "0x0200040000000000000000000000000000000000000000000000000000000000", "0x0200050000000000000000000000000000000000000000000000000000000000", "0x02000c0000000000000000000000000000000000000000000000000000000000", "0x02000a0000000000000000000000000000000000000000000000000000000000", "0x0200080000000000000000000000000000000000000000000000000000000000", "0x0200090000000000000000000000000000000000000000000000000000000000", "0x0200060000000000000000000000000000000000000000000000000000000000", "0x0200070000000000000000000000000000000000000000000000000000000000", "0x02000b0000000000000000000000000000000000000000000000000000000000", "0x02000d0000000000000000000000000000000000000000000000000000000000", "0x02000e0000000000000000000000000000000000000000000000000000000000", "0x02000f0000000000000000000000000000000000000000000000000000000000", "0x006a271832f44c93bd8692584d85415f0f3dccef9748fecd129442c8edcb4361"] }, "targetAssetReserves": { "greaterThan": "0" } } } })
  edges.forEach(i => api.addUSDValue(+i.node.liquidityUSD > 0 ? +i.node.liquidityUSD : 0))
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "All pools from https://polkaswap.io launched on SORA network are included in TVL. Data comes from https://polkaview.io",
  sora: { tvl },
};


// on-chain
/* 
const { getExports } = require('./helper/heroku-api')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("stackswap", ['stacks']),
}
 */