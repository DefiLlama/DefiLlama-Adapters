const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const {
  deriveUncxVault,
  toBigInt,
  addProportionalReserves,
  getLockerTokenLocks,
  getUniqueAddresses,
} = require('./utils')

const PROGRAM_LOCKER_AMM = 'GsSCS3vPWrtJ5Y9aEVVT65fmrex5P5RGHXdZvsdbWgfo'
const PROGRAM_LOCKER_NEW_AMM = 'UNCX77nZrA3TdAxMEggqG18xxpgiNGT6iqyynPwpoxN'

async function addRaydiumAmmLocks({ api, programId }) {
  const locks = await getLockerTokenLocks(programId, api)
  if (!locks.length) return

  const poolIds = getUniqueAddresses(locks.map(({ account }) => account.ammId.toBase58()), 'solana')
  const uncxVaults = poolIds.map(poolId => deriveUncxVault(poolId, programId))

  const [poolInfos, lpVaultInfos] = await Promise.all([
    getMultipleAccounts([...poolIds]),
    getMultipleAccounts([...uncxVaults]),
  ])

  const lpLockedByPool = new Map()
  poolIds.forEach((poolId, i) => {
    const info = lpVaultInfos[i]
    if (!info) return
    const vault = decodeAccount('tokenAccount', info)
    const amount = toBigInt(vault.amount)
    if (amount > 0n) lpLockedByPool.set(poolId, amount)
  })

  const pools = new Map()
  const tokenAccounts = []
  const lpMints = []

  poolIds.forEach((poolId, i) => {
    const raw = poolInfos[i]
    const lpLocked = lpLockedByPool.get(poolId)
    if (!raw?.data || !lpLocked) return
    const pool = decodeAccount('raydiumLPv4', raw)
    pools.set(poolId, {
      baseVault: pool.baseVault.toBase58(),
      quoteVault: pool.quoteVault.toBase58(),
      baseMint: pool.baseMint.toBase58(),
      quoteMint: pool.quoteMint.toBase58(),
      lpMint: pool.lpMint.toBase58(),
      lpLocked,
    })
    tokenAccounts.push(pool.baseVault.toBase58(), pool.quoteVault.toBase58())
    lpMints.push(pool.lpMint.toBase58())
  })

  if (!pools.size) return

  const uniqueVaults = getUniqueAddresses(tokenAccounts, 'solana')
  const uniqueMints = getUniqueAddresses(lpMints, 'solana')
  const [vaultInfos, mintInfos] = await Promise.all([
    getMultipleAccounts([...uniqueVaults]),
    getMultipleAccounts([...uniqueMints]),
  ])

  const vaultAmounts = new Map()
  uniqueVaults.forEach((vault, i) => {
    const info = vaultInfos[i]
    if (!info) return
    const decoded = decodeAccount('tokenAccount', info)
    vaultAmounts.set(vault, toBigInt(decoded.amount))
  })

  const lpSupplies = new Map()
  uniqueMints.forEach((mint, i) => {
    const info = mintInfos[i]
    if (!info) return
    const decoded = decodeAccount('mint', info)
    lpSupplies.set(mint, toBigInt(decoded.supply))
  })

  pools.forEach(({ baseVault, quoteVault, baseMint, quoteMint, lpMint, lpLocked }) => {
    const reserveA = vaultAmounts.get(baseVault) ?? 0n
    const reserveB = vaultAmounts.get(quoteVault) ?? 0n
    const lpSupply = lpSupplies.get(lpMint) ?? 0n
    if (reserveA === 0n && reserveB === 0n) return
    addProportionalReserves({
      api,
      mintA: baseMint,
      mintB: quoteMint,
      lockedLp: lpLocked,
      reserveA,
      reserveB,
      lpSupply,
    })
  })
}

async function addAmmLocks(api) {
  await addRaydiumAmmLocks({ api, programId: PROGRAM_LOCKER_AMM })
  await addRaydiumAmmLocks({ api, programId: PROGRAM_LOCKER_NEW_AMM })
}

module.exports = {
  addAmmLocks,
}
