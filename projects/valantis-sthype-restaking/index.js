const STHYPE = '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1'
const ESCROW = '0x0447d0339c82a8EFe01994b7D1981bf5c517da0e'
const SEED_OWNER = '0x0000000000000000000000000000000000000001'
const ESCROW_DEPLOY_BLOCK = 47206861

async function tvl(api) {
  if (await api.getBlock() < ESCROW_DEPLOY_BLOCK) return
  const [accounting, seed, custody] = await api.batchCall([
    { target: ESCROW, abi: 'function totalAccounting() view returns (uint256 activeRawShares,uint256 totalOwnershipUnits,uint256 requestedRawShares,uint256 rewardRawShares)' },
    { target: ESCROW, abi: 'function account(address) view returns (uint256 ownershipUnits,uint256 activeRawShares,uint256 activeWstHype)', params: [SEED_OWNER] },
    { target: STHYPE, abi: 'function sharesOf(address) view returns (uint256)', params: [ESCROW] },
  ])
  const [active, units, requested, rewards] = Array.from(accounting, BigInt)
  const seedUnits = BigInt(seed[0])
  if (seedUnits > units || (units === 0n && active !== 0n)) throw new Error('Invalid Valantis escrow ownership accounting')
  // only a shortfall is invalid; shares sent to the escrow outside the accounting are not user claims
  if (BigInt(custody) < active + requested + rewards) throw new Error('Valantis escrow custody does not reconcile')
  const seedShares = units === 0n ? 0n : active * seedUnits / units
  const userShares = active - seedShares + requested
  api.add(STHYPE, await api.call({ target: STHYPE, abi: 'function sharesToBalance(uint256) view returns (uint256)', params: [userShares.toString()] }))
}

module.exports = {
  start: '2026-09-29',
  methodology: 'Counts active user stHYPE plus pending withdrawals in the restaking escrow. Excludes unreleased reward reserves and the permanent seed. stHYPE and wstHYPE represent the same shares and are counted once.',
  hyperliquid: { tvl },
}
