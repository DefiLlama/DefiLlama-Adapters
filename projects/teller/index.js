const { getConfig } = require('../helper/cache')

const EARN_API = 'https://earn-single-token-middleware-production.up.railway.app/tvl/borrow-multi'
const LEND_API = 'https://subgraph-to-frontend-middleware-production.up.railway.app/lend/pools?chainId='

const abis = {
  principalToken: 'address:principalToken',
  totalInterestCollected: "function totalInterestCollected() view returns (uint256)",
  getTokenDifferenceFromLiquidations: "function getTokenDifferenceFromLiquidations() view returns (int256)",
  totalPrincipalTokensWithdrawn: "function totalPrincipalTokensWithdrawn() view returns (uint256)",
  totalPrincipalTokensCommitted: "function totalPrincipalTokensCommitted() view returns (uint256)",
  totalPrincipalTokensLended: "function totalPrincipalTokensLended() view returns (uint256)",
  totalPrincipalTokensRepaid: "function totalPrincipalTokensRepaid() view returns (uint256)"
}

const computePoolValue = (index, { totalInterests, diffLiquidations, totalWithdrawns, totalCommitteds, totalLendeds, totalRepaids }, isBorrow = false) => {
  const borrowed = Number(totalLendeds[index]) - Number(totalRepaids[index])
  if (isBorrow) return borrowed
  const totalCommitted = Number(totalCommitteds[index]) + Number(totalInterests[index]) + Number(diffLiquidations[index]) - Number(totalWithdrawns[index])
  return totalCommitted - borrowed
}

const getData = async (api) => {
  const [lendData, borrowData] = await Promise.all([
    getConfig('teller/lend-' + api.chain, `${LEND_API}${api.chainId}`),
    getConfig('teller/earn', EARN_API)
  ])

  const lendPools = Object.values(lendData).flatMap(p => p.map(x => x.id))
  const earnPools = Object.values(borrowData[api.chainId] || {}).flatMap(p => p.map(x => x.pool_address))

  const pools = [...new Set([...lendPools, ...earnPools])]

  const [principalToken, totalInterests, diffLiquidations, totalWithdrawns, totalCommitteds, totalLendeds, totalRepaids] = await Promise.all([
    api.multiCall({ calls: pools, abi: abis.principalToken }),
    api.multiCall({ calls: pools, abi: abis.totalInterestCollected }),
    api.multiCall({ calls: pools, abi: abis.getTokenDifferenceFromLiquidations }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensWithdrawn }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensCommitted }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensLended }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensRepaid })
  ])

  return { pools, principalToken, totalInterests, diffLiquidations, totalWithdrawns, totalCommitteds, totalLendeds, totalRepaids }
}

const tvl = async (api) => {
  const data = await getData(api)
  data.pools.forEach((_, i) => {
    const token = data.principalToken[i]
    const value = computePoolValue(i, data, false)
    if (value > 0) api.add(token, value)
  })
}

const borrowed = async (api) => {
  const data = await getData(api)
  data.pools.forEach((_, i) => {
    const token = data.principalToken[i]
    const value = computePoolValue(i, data, true)
    if (value > 0) api.add(token, value)
  })
}

const CHAINS = ["ethereum", "base", "arbitrum", "hyperliquid", "polygon", "katana"]

CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})