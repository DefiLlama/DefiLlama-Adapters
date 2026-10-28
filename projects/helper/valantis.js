const ADDRESSES = require('./coreAssets.json')

// https://docs.valantis.xyz/stakedhype/integrate and STEXAMM::withdrawalModule().
const STHYPE = '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1'
const WHYPE = ADDRESSES.hyperliquid.WHYPE
const ESCROW = '0x0447d0339c82a8EFe01994b7D1981bf5c517da0e'
const SEED_OWNER = '0x0000000000000000000000000000000000000001'
const ORIGINAL_WITHDRAWAL_MODULE = '0x40ba056b004edd0b572509a1276fd8530cf2bb7f'

// Verified first-code blocks on HyperEVM (999), not Unix timestamps.
const DEPLOYMENTS = {
  sthype: 25412,
  sthypeStex: 1937868,
  khypeStex: 7773262,
  restaking: 47206861,
}

/**
 * Compute user claims and backing in raw stHYPE shares (24 decimals).
 * Accounting previews elapsed rewards and recognized surplus; exclude the
 * permanent seed's active entitlement and unreleased rewards from user claims.
 */
function restakingShares(accounting, seedUnits) {
  const [active, units, requested, rewards] = Array.from(accounting, BigInt)
  seedUnits = BigInt(seedUnits)
  if (seedUnits > units || (units === 0n && active !== 0n)) throw new Error('Invalid Valantis escrow ownership accounting')
  const seed = units === 0n ? 0n : active * seedUnits / units
  return { active: active - seed, pending: requested, userClaims: active - seed + requested, custody: active + requested + rewards }
}

/** Compute HYPE-wei LP NAV and nonnegative live-stHYPE/native components. */
function stexNav({ reserve0, reserve1, lending, converted0, pending, nativeBalance, claimable, pendingBefore }) {
  const excess = nativeBalance > claimable ? nativeBalance - claimable : 0n
  const surplus = excess > pendingBefore ? excess - pendingBefore : 0n
  const nav = reserve1 + lending + converted0 + surplus - pending
  if (nav < 0n) throw new Error('Negative Valantis STEX net assets')
  // Allocate liabilities to the native component first. Never report negative
  // token balances; only unburned stHYPE can overlap with stHYPE totalSupply().
  const liveStHype = reserve0 < nav ? reserve0 : nav
  return { nav, liveStHype, native: nav - liveStHype }
}

/** Read block-pinned STEX reserves and withdrawal accounting, including legacy modules. */
async function readStex(api, stex, deploymentBlock) {
  if (await api.getBlock() < deploymentBlock) return { nav: 0n, liveStHype: 0n, native: 0n }
  const [pool, module] = await api.batchCall([
    { target: stex, abi: 'address:pool' },
    // SDK address-getter caching ignores block numbers; this module is mutable.
    { target: stex, abi: 'address:withdrawalModule', skipCache: true },
  ])
  const [reserves, lending, pending0, pending1, claimable] = await api.batchCall([
    { target: pool, abi: 'function getReserves() view returns (uint256,uint256)' },
    { target: module, abi: 'uint256:amountToken1LendingPool' },
    { target: module, abi: 'uint256:amountToken0PendingUnstaking' },
    { target: module, abi: 'uint256:amountToken1PendingLPWithdrawal' },
    { target: module, abi: 'uint256:amountToken1ClaimableLPWithdrawal' },
  ])
  const reserve0 = BigInt(reserves[0])
  const nativeBalance = BigInt(await api.getGasTokenBalance(module))
  let pendingBefore = 0n
  if (nativeBalance > BigInt(claimable)) {
    // The original deployment exposed the storage getter under a leading '_'.
    // Later modules provide the explicit BeforeUpdate getter used by STEXLens.
    const abi = module.toLowerCase() === ORIGINAL_WITHDRAWAL_MODULE
      ? 'uint256:_amountToken1PendingLPWithdrawal'
      : 'uint256:amountToken1PendingLPWithdrawalBeforeUpdate'
    pendingBefore = BigInt(await api.call({ target: module, abi }))
  }
  const converted0 = BigInt(await api.call({
    target: module,
    abi: 'function convertToToken1(uint256) view returns (uint256)',
    params: [(reserve0 + BigInt(pending0)).toString()],
  }))
  return stexNav({ reserve0, reserve1: BigInt(reserves[1]), lending: BigInt(lending), converted0,
    pending: BigInt(pending1), nativeBalance, claimable: BigInt(claimable), pendingBefore })
}

/** Read active-user plus pending-withdrawal claims, returned as nominal stHYPE wei. */
async function readRestaking(api) {
  if (await api.getBlock() < DEPLOYMENTS.restaking) return 0n
  const [accounting, account, custody] = await api.batchCall([
    { target: ESCROW, abi: 'function totalAccounting() view returns (uint256 activeRawShares,uint256 totalOwnershipUnits,uint256 requestedRawShares,uint256 rewardRawShares)' },
    { target: ESCROW, abi: 'function account(address) view returns (uint256 ownershipUnits,uint256 activeRawShares,uint256 activeWstHype)', params: [SEED_OWNER] },
    { target: STHYPE, abi: 'function sharesOf(address) view returns (uint256)', params: [ESCROW] },
  ])
  const shares = restakingShares(accounting, account[0])
  // totalAccounting() determines how recognized surplus is allocated. Do not
  // add extra custody to user claims here; only insufficient backing is invalid.
  if (BigInt(custody) < shares.custody) throw new Error('Valantis escrow custody does not reconcile')
  return BigInt(await api.call({ target: STHYPE, abi: 'function sharesToBalance(uint256) view returns (uint256)', params: [shares.userClaims.toString()] }))
}

module.exports = { STHYPE, WHYPE, ESCROW, DEPLOYMENTS, restakingShares, stexNav, readStex, readRestaking }
