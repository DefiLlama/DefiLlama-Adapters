const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const {
  deriveUncxVault,
  toBigInt,
  addProportionalReserves,
  getLockerTokenLocks,
} = require('./utils')

const PROGRAM_LOCKER_CP_SWAP = 'UNCXdvMRxvz91g3HqFmpZ5NgmL77UH4QRM4NfeL4mQB'
const TOKEN_LOCK_SIZE_CP_SWAP = 180

async function addCpSwapLocks(api) {
  const locks = await getLockerTokenLocks(PROGRAM_LOCKER_CP_SWAP, api, 'unicryptTokenLock', TOKEN_LOCK_SIZE_CP_SWAP)
  if (!locks.length) return

  const poolIds = getUniqueAddresses(locks.map(({ account }) => account.ammId.toBase58()), 'solana')
  const uncxVaults = poolIds.map(poolId => deriveUncxVault(poolId, PROGRAM_LOCKER_CP_SWAP))

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
  const tokenVaultAccounts = []
  let skipped = 0
  let skipReason
  poolIds.forEach((poolId, i) => {
    const raw = poolInfos[i]
    const lpLocked = lpLockedByPool.get(poolId)
    if (!raw?.data || !lpLocked) return
    try {
      const pool = decodeAccount('raydiumCpSwapPoolState', raw)
      const token0Vault = pool.token0Vault.toBase58()
      const token1Vault = pool.token1Vault.toBase58()
      const token0Mint = pool.token0Mint.toBase58()
      const token1Mint = pool.token1Mint.toBase58()
      const lpSupply = toBigInt(pool.lpSupply)
      if (lpSupply <= 0n) return
      pools.set(poolId, { token0Vault, token1Vault, token0Mint, token1Mint, lpSupply, lpLocked })
      tokenVaultAccounts.push(token0Vault, token1Vault)
    } catch (e) {
      skipped += 1
      if (!skipReason) skipReason = e?.message || 'decode failed'
    }
  })
  if (skipped) api?.log?.(`[unicrypt-solana] skipped ${skipped} Raydium CP-Swap pool accounts: ${skipReason}`)

  if (!pools.size || !tokenVaultAccounts.length) return

  const uniqueTokenVaults = getUniqueAddresses(tokenVaultAccounts, 'solana')
  const tokenVaultInfos = await getMultipleAccounts([...uniqueTokenVaults])
  const tokenVaultAmounts = new Map()
  uniqueTokenVaults.forEach((vault, i) => {
    const info = tokenVaultInfos[i]
    if (!info) return
    const decoded = decodeAccount('tokenAccount', info)
    tokenVaultAmounts.set(vault, toBigInt(decoded.amount))
  })

  pools.forEach(({ token0Vault, token1Vault, token0Mint, token1Mint, lpSupply, lpLocked }) => {
    const reserve0 = tokenVaultAmounts.get(token0Vault) ?? 0n
    const reserve1 = tokenVaultAmounts.get(token1Vault) ?? 0n
    if (reserve0 === 0n && reserve1 === 0n) return
    addProportionalReserves({
      api,
      mintA: token0Mint,
      mintB: token1Mint,
      lockedLp: lpLocked,
      reserveA: reserve0,
      reserveB: reserve1,
      lpSupply,
    })
  })
}

module.exports = {
  addCpSwapLocks,
}
