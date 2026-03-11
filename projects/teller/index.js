const { getConfig } = require('../helper/cache')

const EARN_API = 'https://earn-single-token-middleware-production.up.railway.app/tvl/borrow-multi'
const LEND_API = 'https://subgraph-to-frontend-middleware-production.up.railway.app/lend/pools?chainId='

const abis = {
  principalToken: 'address:principalToken',
  totalPrincipalTokensLended: "function totalPrincipalTokensLended() view returns (uint256)",
  totalPrincipalTokensRepaid: "function totalPrincipalTokensRepaid() view returns (uint256)"
}

const getData = async (api) => {
  const [lendData, earnData] = await Promise.all([
    getConfig('teller/lend-' + api.chain, `${LEND_API}${api.chainId}`),
    getConfig('teller/earn', EARN_API)
  ])

  const lendPools = Object.values(lendData).flatMap(p => p.map(x => x.id))
  const earnPools = Object.values(earnData[api.chainId] || {}).flatMap(p => p.map(x => x.pool_address))

  const pools = [...new Set([...lendPools, ...earnPools])]
  .filter(id => /^0x[0-9a-fA-F]{40}$/.test(id))  // filter bad addresses from API


  const [principalTokens, totalLendeds, totalRepaids] = await Promise.all([
    api.multiCall({ calls: pools, abi: abis.principalToken }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensLended }),
    api.multiCall({ calls: pools, abi: abis.totalPrincipalTokensRepaid })
  ])

  return { pools, principalTokens, totalLendeds, totalRepaids }
}

const tvl = async (api) => {
  const data = await getData(api)
  const { pools, principalTokens } = data
  const calls = pools.map((p, i) => ({ target: principalTokens[i], params: p }))
  const balances = await api.multiCall({ calls, abi: 'erc20:balanceOf' })
  api.add(principalTokens, balances)
}

const borrowed = async (api) => {
  const data = await getData(api)
  const  { pools, principalTokens, totalLendeds, totalRepaids } = data
  pools.forEach((_, i) => {
    api.add(principalTokens[i], Number(totalLendeds[i]) - Number(totalRepaids[i]))
  })
}

const CHAINS = ["ethereum", "base", "arbitrum", "hyperliquid", "polygon", "katana"]

CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})