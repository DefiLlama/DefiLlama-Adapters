const FACTORY = '0xbbbbbbbbbd5e955E20F323cA1F95f8191fD0E0BF'

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'getOfficialPoolsCount', itemAbi: 'officialPools', target: FACTORY })
  const tokens = await api.multiCall({ target: FACTORY, abi: 'function getPoolTokens(address pool) view returns (address[])', calls: pools })
  await api.sumTokens({ ownerTokens: pools.map((pool, i) => [tokens[i], pool]) })
  // hook-invested tranches (Euler/Aave) sit outside the pool but belong to its LPs
  const invested = await api.multiCall({ abi: 'function getInvested(address) view returns (uint128)', calls: pools.flatMap((pool, i) => tokens[i].map(token => ({ target: pool, params: [token] }))) })
  pools.flatMap((_, i) => tokens[i]).forEach((token, i) => api.add(token, invested[i]))
}

module.exports = {
  methodology: "Sums the token balances held by every official BTR pool listed by the PoolFactory. Adds each pool's hook-invested amount (Euler/Aave), which stays owned by the pool's LPs.",
  start: '2026-10-01',
  monad: { tvl },
}
