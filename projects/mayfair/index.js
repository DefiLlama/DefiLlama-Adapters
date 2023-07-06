const { request } = require("../helper/utils/graphql")

const { toUSDTBalances } = require("../helper/balances");

const url = "https://squid.subsquid.io/mayfair-indexer/graphql"

async function getData() {
  return await request(url, "query Analytics {\n  balancerVaults {\n    id\n    totalStaked\n    totalValueLocked\n  }\n}\n")
}

async function getStaking() {
  let staking = 0
  const data = await getData()
  staking = data.balancerVaults?.[0].totalStaked;
  return toUSDTBalances(staking)
}

async function getTVL() {
  let tvl = 0
  const data = await getData()
  tvl = data.balancerVaults?.[0].totalValueLocked + data.balancerVaults?.[0].totalStaked;
  return toUSDTBalances(tvl)
}

module.exports = {
  arbitrum: {
    tvl: getTVL,
    staking: getStaking
  }
}
