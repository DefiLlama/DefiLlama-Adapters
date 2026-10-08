// BTR DEX (AIMM) - adaptive inventory market maker.
// Live: Monad mainnet (143). BNB Smart Chain (56) and the other dex-evm targets are scaffolded with
// no deployed pool factory yet, so they are intentionally absent (do not list a chain with no pools).
//
// Pools are deterministic CREATE3 PoolProxy instances minted by the PoolFactory (same address on
// every chain). Each pool holds N legs (base + spokes); a leg's economic token balance is
// Asset.reserves. Rehypothecation hooks (`Pool.hookInvest`) push a tranche to an external venue
// (Euler/Aave) without debiting `reserves`; the tranche is tracked separately as `custody.invested`
// and `Pool.getLiquidReserves` = `reserves - invested`. Those external venues are themselves listed
// on DefiLlama, so counting the invested tranche here would double count it; we list only the
// **liquid** reserves. Source: dex-evm/src/Pool.sol (getBuffer, hookInvest) and
// dex-evm/src/interfaces/IPool.sol.
const FACTORY = '0xbbbbbbbbbd5e955E20F323cA1F95f8191fD0E0BF'

const abi = {
  getOfficialPoolsCount: 'function getOfficialPoolsCount() view returns (uint256)',
  officialPools: 'function officialPools(uint256) view returns (address)',
  getPoolTokens: 'function getPoolTokens(address pool) view returns (address[])',
  getBuffer: 'function getBuffer(address token) view returns (uint256 reserves, uint256 invested, uint256 minLiquidity)',
}

async function tvl(api) {
  const count = Number(await api.call({ target: FACTORY, abi: abi.getOfficialPoolsCount }))
  if (!count) return
  const pools = await api.multiCall({
    target: FACTORY,
    abi: abi.officialPools,
    calls: Array.from({ length: count }, (_, i) => ({ params: [i] })),
  })
  const tokenLists = await api.multiCall({ target: FACTORY, abi: abi.getPoolTokens, calls: pools })
  const calls = []
  tokenLists.forEach((tokens, i) => {
    tokens.forEach((token) => calls.push({ target: pools[i], params: [token], token }))
  })
  const buffers = await api.multiCall({ abi: abi.getBuffer, calls })
  buffers.forEach((buffer, i) =>
    api.add(calls[i].token, BigInt(buffer.reserves) - BigInt(buffer.invested)),
  )
}

module.exports = {
  methodology:
    "TVL is the sum of every official BTR pool leg's liquid on-chain token reserves (Pool.getBuffer(token).reserves minus the hook-invested tranche). Tranches pushed to external yield venues (Euler/Aave) are excluded here because those venues are listed on DefiLlama separately, so counting them would double count; treasury and user-payable balances are not separated out.",
  start: '2026-10-01', // PoolFactory.createPool for the Monad USDC hub, block 109610388
  monad: { tvl },
}
