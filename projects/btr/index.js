// one listing for every pool generation; each factory's getAssetHook returns a different shape
const FACTORIES = [
  { factory: '0xbbbbbbbbbd5e955E20F323cA1F95f8191fD0E0BF', hookAbi: 'function getAssetHook(address) view returns (address target, uint32 flags, uint32 lastCreditAt)', hook: r => r.target }, // V1
  { factory: '0xbbbbbbb16b9B5Fa94AD8CD35e696bEA55DB9C8B0', hookAbi: 'function getAssetHook(address) view returns (address)', hook: r => r, from: 1794473003 }, // V2, factory code from block 121557204
]

async function tvl(api) {
  for (const { factory, hookAbi, hook, from = 0 } of FACTORIES) {
    if (api.timestamp < from) continue
    const pools = await api.fetchList({ lengthAbi: 'getOfficialPoolsCount', itemAbi: 'officialPools', target: factory })
    const tokens = await api.multiCall({ target: factory, abi: 'function getPoolTokens(address pool) view returns (address[])', calls: pools })
    await api.sumTokens({ ownerTokens: pools.map((pool, i) => [tokens[i], pool]) })
    // liquidity a leg's yield hook placed in external venues belongs to the pool's LPs: count the hook NAV
    const legs = pools.flatMap((pool, i) => tokens[i].map(token => ({ pool, token })))
    const hooks = await api.multiCall({ abi: hookAbi, calls: legs.map(l => ({ target: l.pool, params: [l.token] })) })
    const live = legs.map((l, i) => ({ ...l, hook: hook(hooks[i]) })).filter(l => +l.hook)
    const nav = await api.multiCall({ abi: 'uint256:navAssets', calls: live.map(l => l.hook) })
    live.forEach((l, i) => api.add(l.token, nav[i]))
  }
}

module.exports = {
  doublecounted: true,
  methodology: "Sums the token balances held by every official BTR pool listed by the V1 and V2 PoolFactory contracts, plus the liquidity each asset's yield hook has deposited in external lending markets or vaults on the pool's behalf, valued at the hook's reported NAV. That liquidity is also counted in those venues' TVL.",
  start: '2026-10-01',
  hallmarks: [['2026-11-12', 'V1 to V2 migration']],
  monad: { tvl },
}
