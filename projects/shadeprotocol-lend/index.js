const { post } = require("../helper/http")

async function getData(api) {
  const isoTimestamp = new Date((api.timestamp - 5 * 60 * 60) * 1000).toISOString()
  const { data: { lendStatsHistories } } = await post('https://prodv1.securesecrets.org/graphql', { "operationName": "getLendHistory", "variables": { "intervalIso": isoTimestamp }, "query": "query getLendHistory($intervalIso: String!) {\n  lendStatsHistories(\n    query: {where: {time: {gte: $intervalIso}}, orderBy: {time: \"desc\"}}\n ) {\n    averageLtv\n    collateralUsd\n    debtAmount\n    debtUsd\n    time\n    __typename\n  }\n}" })
  console.log(lendStatsHistories.length)
  return lendStatsHistories[0]
}

async function tvl(api) {
  const data = await getData(api)
  api.addUSDValue(data.collateralUsd - data.debtUsd)
}

async function borrowed(api) {
  const data = await getData(api)
  api.addUSDValue(data.debtUsd)
}


module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl,
    borrowed,
  }
}
