const { sumTokens2 } = require('../helper/unwrapLPs')

// Flock Manager on Robinhood Chain: auto-compounding LP vaults, plus a
// Tarot-core lending layer that takes those vault shares as collateral. The
// vaults come from two factories: UPDEX vaults stake in the DEX gauge, and
// GigaDex vaults stake Giga Classic LP in Giga's ClassicChef.
//
// Value flows LP -> vault (staked in the gauge or chef) -> vault shares ->
// collateral -> borrow from the borrowables. Counting both the vault LP and
// the collateral would count the same assets twice, because the collateral
// contract holds nothing but the vault share wrapper. So TVL is:
//
//   the LP the vaults have staked, unwrapped to its two underlying tokens
// + the idle underlying sitting in each borrowable (lender supply not lent)
//
// and the collateral contracts are never summed. Vault LP that pairs with RVH,
// the parent protocol's token, is reported under pool2 instead of tvl.
//
// The Ravenhood lending vaults (rvhUSDG/rvhWETH/rvhUP) are deliberately
// absent: they are depositors INTO the borrowables, so their balances are
// already inside the borrowable figures above.
const LEND_FACTORY = '0x8F50BCb1f34D22adAe05955E1994b0153603cB16'
const VAULT_FACTORY = '0x4c2302416bf50B4F11dDEE7A8feA2D1BA96d8EfE'
// Deployed 2026-10-24 at block 96985642, after the adapter's start date.
const GIGA_VAULT_FACTORY = '0x1955e758aDb00a75Bc1A471082254d13Ab8D1347'
const RVH = '0x96765066f6a040a21EB027167D2315B707c82633'

const abi = {
  allVaultsLength: 'uint256:allVaultsLength',
  allVaults: 'function allVaults(uint256) view returns (address)',
  allLendingPoolsLength: 'uint256:allLendingPoolsLength',
  allLendingPools: 'function allLendingPools(uint256) view returns (address)',
  getLendingPool: 'function getLendingPool(address) view returns (bool initialized, uint24 lendingPoolId, address collateral, address borrowable0, address borrowable1)',
  underlying: 'address:underlying',
  gauge: 'address:gauge',
  chef: 'address:chef',
  pid: 'uint256:pid',
  userInfo: 'function userInfo(uint256 pid, address user) view returns (uint256 amount, uint256 rewardDebt)',
  token0: 'address:token0',
  token1: 'address:token1',
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
  const poolData = await api.multiCall({ target: LEND_FACTORY, abi: abi.getLendingPool, calls: pools })
  const borrowables = []
  poolData.forEach((pool) => {
    if (pool.initialized) borrowables.push(pool.borrowable0, pool.borrowable1)
  })
  return borrowables
}

// The vaults stake their LP, so it is not held by the vault address. UPDEX
// vaults hold it in the DEX gauge (read as the vault's gauge balance), GigaDex
// vaults in Giga's ClassicChef (read as the chef's userInfo for the vault's
// pid). resolveLP then unwraps the LP into its two tokens.
async function getUpdexStaked(api) {
  const vaults = await api.fetchList({
    lengthAbi: abi.allVaultsLength,
    itemAbi: abi.allVaults,
    target: VAULT_FACTORY,
  })
  const lps = await api.multiCall({ abi: abi.underlying, calls: vaults })
  const gauges = await api.multiCall({ abi: abi.gauge, calls: vaults })
  const staked = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: vaults.map((vault, i) => ({ target: gauges[i], params: vault })),
  })
  return { lps, staked }
}

async function getGigaStaked(api) {
  // Before the factory existed the length call reverts; report nothing for
  // those blocks instead of failing the whole adapter.
  const length = await api.call({ target: GIGA_VAULT_FACTORY, abi: abi.allVaultsLength, permitFailure: true })
  if (!length || Number(length) === 0) return { lps: [], staked: [] }
  const vaults = await api.multiCall({
    target: GIGA_VAULT_FACTORY,
    abi: abi.allVaults,
    calls: [...Array(Number(length)).keys()],
  })
  const lps = await api.multiCall({ abi: abi.underlying, calls: vaults })
  const chefs = await api.multiCall({ abi: abi.chef, calls: vaults })
  const pids = await api.multiCall({ abi: abi.pid, calls: vaults })
  const infos = await api.multiCall({
    abi: abi.userInfo,
    calls: vaults.map((vault, i) => ({ target: chefs[i], params: [pids[i], vault] })),
  })
  return { lps, staked: infos.map((info) => info.amount) }
}

async function addVaultLp(api, isPool2) {
  const updex = await getUpdexStaked(api)
  const giga = await getGigaStaked(api)
  const lps = [...updex.lps, ...giga.lps]
  const staked = [...updex.staked, ...giga.staked]
  const token0s = await api.multiCall({ abi: abi.token0, calls: lps })
  const token1s = await api.multiCall({ abi: abi.token1, calls: lps })

  const isRvh = (token) => token.toLowerCase() === RVH.toLowerCase()
  lps.forEach((lp, i) => {
    const hasRvh = isRvh(token0s[i]) || isRvh(token1s[i])
    if (hasRvh === isPool2) api.add(lp, staked[i])
  })
  return sumTokens2({ api, resolveLP: true })
}

async function tvl(api) {
  await addVaultLp(api, false)

  // Lending side. Only the idle balance: anything lent out is reported under
  // borrowed instead, so the two never overlap.
  const borrowables = await getBorrowables(api)
  const tokens = await api.multiCall({ abi: abi.underlying, calls: borrowables })
  return sumTokens2({ api, tokensAndOwners: tokens.map((token, i) => [token, borrowables[i]]) })
}

async function pool2(api) {
  return addVaultLp(api, true)
}

async function borrowed(api) {
  const borrowables = await getBorrowables(api)
  const tokens = await api.multiCall({ abi: abi.underlying, calls: borrowables })
  const debts = await api.multiCall({ abi: abi.totalBorrows, calls: borrowables })
  api.add(tokens, debts)
  return api.getBalances()
}

module.exports = {
  timetravel: true,
  doublecounted: true,
  // Both factories went live on 2026-10-01 (blocks 77687484 and 77687985) and
  // the first market followed at 77688034. Starting on the 2nd rather than
  // the 1st so no historical query lands on a block where the factories have
  // no code yet, which would revert rather than report zero.
  start: '2026-10-02',
  methodology: 'TVL is the LP staked by the Flock Manager auto-compounding vaults, unwrapped into its underlying tokens, plus the idle underlying held by each Flock Lend borrowable. UPDEX (up-v2) vaults are read from each vault\'s gauge balance and GigaDex vaults from Giga\'s ClassicChef userInfo. Vault LP paired with RVH, the protocol\'s token, is reported as pool2. Collateral contracts are not counted because they hold only vault shares, a wrapper around LP already counted. The LP is also counted by the DEX listings, so the protocol is marked as double counted. Borrowed is the outstanding debt of each borrowable and is reported separately, not included in TVL.',
  robinhood: { tvl, pool2, borrowed },
}
