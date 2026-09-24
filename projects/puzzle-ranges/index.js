// Ranges — a fork of the Balancer V3 stack running its own (non-canonical) Vault.
// Pools are created exclusively by the permissioned RangePoolFactory, so enumerating the
// factory is equivalent to enumerating the Vault's registered pools, and needs a single
// view call instead of a full PoolRegistered log scan.
// The Range stack is deployed deterministically, so the factory and Vault carry the SAME
// addresses on every chain after ethereum - the address does not identify the chain, only the
// `api.chain` key does. Never copy an entry between chains without checking the deployment.
const config = {
  ethereum: {
    vault: '0x955244EDC797A1C1b04134b600f819aC23C76081',
    factories: ['0x5D6D1dC0D045a8DE284C7Ab5FE83aCd7bdc5d4E0'],
  },
  robinhood: {
    vault: '0x50A20332547453558E58afa9Ef4cF73033Ce3BE3',
    factories: ['0x7fb8016798Ab5Ec8F70f40B5af6677986fDBAb86'],
  },
}

const abis = {
  getPools: 'function getPools() view returns (address[])',
  getPoolTokenInfo: 'function getPoolTokenInfo(address pool) view returns (address[] tokens, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastLiveBalances)',
}

async function tvl(api) {
  const { vault, factories } = config[api.chain]
  const pools = (await api.multiCall({ abi: abis.getPools, calls: factories })).flat()
  const poolSet = new Set(pools.map(i => i.toLowerCase()))

  const poolTokenInfo = await api.multiCall({
    target: vault,
    abi: abis.getPoolTokenInfo,
    calls: pools.map(pool => ({ params: [pool] })),
    // the factory keeps minting pools, so this list grows between runs; a single pool that
    // starts reverting should cost its own balances, not the whole chain's tvl
    permitFailure: true,
  })

  // ...but a dead RPC must not pass for an empty protocol: reporting 0 overwrites the chart,
  // while throwing only skips this run. An empty `pools` stays a legitimate 0 — that is a
  // chain where no pool has been created yet.
  const read = poolTokenInfo.filter(Boolean)
  if (pools.length && !read.length)
    throw new Error(`puzzle-ranges: all ${pools.length} getPoolTokenInfo calls failed on ${api.chain}`)

  read.forEach(({ tokens, balancesRaw }) => {
    tokens.forEach((token, i) => {
      // a few range pools hold other range pools' BPTs; the child pool's own balances are
      // already counted above, so counting the BPT too would double count it
      if (poolSet.has(token.toLowerCase())) return
      api.add(token, balancesRaw[i])
    })
  })
}

module.exports = {
  methodology: 'TVL is the sum of the actual token balances (balancesRaw) the Ranges Vault holds for every pool listed by the RangePoolFactory, read with vault.getPoolTokenInfo. BPTs of range pools held by other range pools are excluded so that the underlying assets of a nested pool are not counted twice.',
  ethereum: {
    tvl,
    start: '2026-02-28',
  },
  robinhood: {
    tvl,
    start: '2026-09-08',
  },
}
