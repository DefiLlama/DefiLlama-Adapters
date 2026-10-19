const FACTORY = '0xbbbbbbbbbd5e955E20F323cA1F95f8191fD0E0BF'

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'getOfficialPoolsCount', itemAbi: 'officialPools', target: FACTORY })
  const tokens = await api.multiCall({ target: FACTORY, abi: 'function getPoolTokens(address pool) view returns (address[])', calls: pools })
  await api.sumTokens({ ownerTokens: pools.map((pool, i) => [tokens[i], pool]) })
  // liquidity a pool's yield hook placed in external venues belongs to its LPs: count the hook NAV
  const legs = pools.flatMap((pool, i) => tokens[i].map(token => ({ pool, token })))
  const hooks = await api.multiCall({ abi: 'function getAssetHook(address) view returns (address target, uint32 flags, uint32 lastCreditAt)', calls: legs.map(l => ({ target: l.pool, params: [l.token] })) })
  const live = legs.map((l, i) => ({ ...l, hook: hooks[i].target })).filter(l => +l.hook)
  const nav = await api.multiCall({ abi: 'uint256:navAssets', calls: live.map(l => l.hook), permitFailure: true })
  const book = await api.multiCall({ abi: 'function getInvested(address) view returns (uint128)', calls: live.map(l => ({ target: l.pool, params: [l.token] })) })
  live.forEach((l, i) => api.add(l.token, nav[i] ?? book[i]))
}

module.exports = {
  methodology: "Sums the token balances held by every official BTR pool listed by the PoolFactory, plus the liquidity a pool's yield hook has placed in external lending markets or vaults, at the hook's reported NAV.",
  start: '2026-10-01',
  monad: { tvl },
}
