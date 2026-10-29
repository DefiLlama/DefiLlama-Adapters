const ADDRESSES = require('./coreAssets.json')

// https://docs.valantis.xyz/stakedhype/integrate
const STHYPE = '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1'
const WHYPE = ADDRESSES.hyperliquid.WHYPE
const ESCROW = '0x0447d0339c82a8EFe01994b7D1981bf5c517da0e'
const SEED_OWNER = '0x0000000000000000000000000000000000000001'

// Verified first-code blocks on HyperEVM (999), not Unix timestamps.
const DEPLOYMENTS = {
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

module.exports = { STHYPE, WHYPE, ESCROW, DEPLOYMENTS, restakingShares, readRestaking }
