const { request } = require("../helper/utils/graphql")
const { cachedGraphQuery } = require('../helper/cache')

const { toUSDTBalances } = require("../helper/balances")

const url = "https://squid.subsquid.io/mayfair-indexer/graphql"

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
  staking = data.stakingPools?.[0].tvl;
  return toUSDTBalances(staking)
}

async function tvl(_, _1, _2, { api }) {
  const { balancerVaults: [{ pools }] } = await cachedGraphQuery('mayfair', url, `{  balancerVaults { pools{ id vaultId } } }`)
  const data = await api.multiCall({ abi: 'function getPoolTokens(bytes32) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)', calls: pools.map(i => ({ target: i.vaultId, params: i.id })) })
  data.forEach(({ tokens, balances }) => api.addTokens(tokens.slice(1), balances.slice(1)))
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  doublecounted: true, // tokens are in balancer pools
  arbitrum: {
    tvl,
    staking: getStaking
  }
}
