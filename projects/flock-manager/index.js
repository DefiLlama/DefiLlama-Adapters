const { sumTokens2 } = require('../helper/unwrapLPs')

// Flock Manager on Robinhood Chain: auto-compounding gauge LP vaults, plus a
// Tarot-core lending layer that takes those vault shares as collateral.
//
// Value flows LP -> vault (staked in the DEX gauge) -> vault shares ->
// collateral -> borrow from the borrowables. Counting both the vault LP and
// the collateral would count the same assets twice, because the collateral
// contract holds nothing but the vault share wrapper. So TVL is:
//
//   the LP the vaults have staked, unwrapped to its two underlying tokens
// + the idle underlying sitting in each borrowable (lender supply not lent)
//
// and the collateral contracts are never summed.
//
// The Ravenhood lending vaults (rvhUSDG/rvhWETH/rvhUP) are deliberately
// absent: they are depositors INTO the borrowables, so their balances are
// already inside the borrowable figures above.
const LEND_FACTORY = '0x8F50BCb1f34D22adAe05955E1994b0153603cB16'
const VAULT_FACTORY = '0x4c2302416bf50B4F11dDEE7A8feA2D1BA96d8EfE'

const abi = {
  allVaultsLength: 'uint256:allVaultsLength',
  allVaults: 'function allVaults(uint256) view returns (address)',
  allLendingPoolsLength: 'uint256:allLendingPoolsLength',
  allLendingPools: 'function allLendingPools(uint256) view returns (address)',
  getLendingPool: 'function getLendingPool(address) view returns (bool initialized, uint24 lendingPoolId, address collateral, address borrowable0, address borrowable1)',
  underlying: 'address:underlying',
  totalBalance: 'uint256:totalBalance',
  totalBorrows: 'function totalBorrows() view returns (uint112)',
}

// Both factories enumerate, so markets and vaults are discovered rather than
// listed here. A new market needs no change to this adapter.
async function getBorrowables(api) {
  const pools = await api.fetchList({
    lengthAbi: abi.allLendingPoolsLength,
    itemAbi: abi.allLendingPools,
    target: LEND_FACTORY,
  })
  const poolData = await api.multiCall({
    target: LEND_FACTORY,
    abi: abi.getLendingPool,
    calls: pools,
    permitFailure: true,
  })
  const borrowables = []
  poolData.forEach((pool) => {
    if (pool && pool.initialized) borrowables.push(pool.borrowable0, pool.borrowable1)
  })
  return borrowables
}

async function tvl(api) {
  // Vault side. totalBalance is the LP the vault has staked in the gauge, so
  // it is not held by the vault address and owner-based discovery would miss
  // it. resolveLP then turns each LP into its two underlying tokens.
  const vaults = await api.fetchList({
    lengthAbi: abi.allVaultsLength,
    itemAbi: abi.allVaults,
    target: VAULT_FACTORY,
  })
  const [vaultLps, vaultStaked] = await Promise.all([
    api.multiCall({ abi: abi.underlying, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: abi.totalBalance, calls: vaults, permitFailure: true }),
  ])
  vaultLps.forEach((lp, i) => {
    if (lp && vaultStaked[i]) api.add(lp, vaultStaked[i])
  })

  // Lending side. Only the idle balance: anything lent out is reported under
  // borrowed instead, so the two never overlap.
  const borrowables = await getBorrowables(api)
  const [lendTokens, lendCash] = await Promise.all([
    api.multiCall({ abi: abi.underlying, calls: borrowables, permitFailure: true }),
    api.multiCall({ abi: abi.totalBalance, calls: borrowables, permitFailure: true }),
  ])
  lendTokens.forEach((token, i) => {
    if (token && lendCash[i]) api.add(token, lendCash[i])
  })

  return sumTokens2({ api, resolveLP: true })
}

async function borrowed(api) {
  const borrowables = await getBorrowables(api)
  const [tokens, debts] = await Promise.all([
    api.multiCall({ abi: abi.underlying, calls: borrowables, permitFailure: true }),
    api.multiCall({ abi: abi.totalBorrows, calls: borrowables, permitFailure: true }),
  ])
  tokens.forEach((token, i) => {
    if (token && debts[i]) api.add(token, debts[i])
  })
  return api.getBalances()
}

module.exports = {
  timetravel: true,
  // Both factories went live on 2026-10-01 (blocks 77687484 and 77687985) and
  // the first market followed at 77688034. Starting on the 2nd rather than
  // the 1st so no historical query lands on a block where the factories have
  // no code yet, which would revert rather than report zero.
  start: '2026-10-02',
  methodology: 'TVL is the LP staked by the Flock Manager auto-compounding vaults, unwrapped into its underlying tokens, plus the idle underlying supplied to each Flock Lend borrowable. Collateral contracts are not counted because they hold only vault shares, a wrapper around LP already counted. Borrowed is the outstanding debt of each borrowable and is reported separately, not included in TVL.',
  robinhood: { tvl, borrowed },
}
