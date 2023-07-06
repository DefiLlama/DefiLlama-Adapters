const { request } = require("../helper/utils/graphql")

const { toUSDTBalances } = require("../helper/balances");

const url = "https://squid.subsquid.io/mayfair-indexer/graphql"

async function getData() {
  return await request(url, "query Analytics {\n  balancerVaults {\n    id\n    totalStaked\n    totalValueLocked\n  }\n}\n")
}
async function getStakingData() {
  return await request(url, `query StakingAnalytics {
    stakingPools(where: {id_eq: "0x3ad426dc2f005b721359a94f8b8d71b8890b3068-0"}) {
      tvl
    }
  }
  `)

}
async function getStaking() {
  let staking = 0
  const data = await getStakingData()
  console.log(data)
  staking = data.stakingPools?.[0].tvl;
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
