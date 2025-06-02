const { post } = require('./helper/http')

async function tvl({timestamp}) {
  const { data: { entities: { nodes } } } = await post('https://api.subquery.network/sq/sora-xor/sora-prod', {
    "query": "query NetworkTvlQuery($after: Cursor, $type: SnapshotType, $from: Int, $to: Int) {\n  entities: networkSnapshots(\n    after: $after\n    orderBy: TIMESTAMP_DESC\n    filter: {and: [{type: {equalTo: $type}}, {timestamp: {lessThanOrEqualTo: $from}}, {timestamp: {greaterThanOrEqualTo: $to}}]}\n  ) {\n    pageInfo {\n      hasNextPage\n      endCursor\n  \n    }\n    nodes {\n      timestamp\n      liquidityUSD\n    }\n  }\n}",
    "operationName": "NetworkTvlQuery",
    "variables": {
      "from": timestamp,
      "to": timestamp - 3600 * 6,
      "type": "HOUR",
      "after": ""
    }
  })
  return {
    tether: nodes[0].liquidityUSD
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "All pools from https://polkaswap.io launched on SORA network are included in TVL. Data comes from https://polkaview.io",
  sora: { tvl },
};
