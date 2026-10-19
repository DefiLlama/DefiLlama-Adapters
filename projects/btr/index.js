const FACTORY = '0xbbbbbbbbbd5e955E20F323cA1F95f8191fD0E0BF'

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'getOfficialPoolsCount', itemAbi: 'officialPools', target: FACTORY })
  const tokens = await api.multiCall({ target: FACTORY, abi: 'function getPoolTokens(address pool) view returns (address[])', calls: pools })
  return api.sumTokens({ ownerTokens: pools.map((pool, i) => [tokens[i], pool]) })
}

module.exports = {
  methodology: "Sums the token balances held by every official BTR pool listed by the PoolFactory. Tranches a pool has pushed to external venues (Euler/Aave) leave the pool and are not counted, since those venues are listed separately.",
  start: '2026-10-01',
  monad: { tvl },
}
