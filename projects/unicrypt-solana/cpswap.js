const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const {
  PROGRAM_LOCKER_CP_SWAP,
  deriveUncxVault,
  getField,
  toBase58,
  toBigInt,
  addProportionalReserves,
  recordDecodeFailure,
  logDecodeFailures,
  getLockerTokenLocks,
  getUniqueAddresses,
} = require('./utils')

async function addCpSwapLocks(api) {
  const locks = await getLockerTokenLocks(PROGRAM_LOCKER_CP_SWAP, 'unicryptTokenLock', api)
  if (!locks.length) return

  const poolIds = getUniqueAddresses(locks.map(({ account }) => toBase58(getField(account, 'ammId', 'amm_id'))).filter(Boolean), 'solana')
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
  const decodeFailures = { count: 0 }
  poolIds.forEach((poolId, i) => {
    const raw = poolInfos[i]
    const lpLocked = lpLockedByPool.get(poolId)
    if (!raw?.data || !lpLocked) return
    try {
      const pool = decodeAccount('raydiumCpSwapPoolState', raw)
      const token0Vault = toBase58(getField(pool, 'token0Vault', 'token_0_vault'))
      const token1Vault = toBase58(getField(pool, 'token1Vault', 'token_1_vault'))
      const token0Mint = toBase58(getField(pool, 'token0Mint', 'token_0_mint'))
      const token1Mint = toBase58(getField(pool, 'token1Mint', 'token_1_mint'))
      const lpSupply = toBigInt(getField(pool, 'lpSupply', 'lp_supply'))
      if (!token0Vault || !token1Vault || !token0Mint || !token1Mint || lpSupply <= 0n) return
      pools.set(poolId, { token0Vault, token1Vault, token0Mint, token1Mint, lpSupply, lpLocked })
      tokenVaultAccounts.push(token0Vault, token1Vault)
    } catch (e) {
      recordDecodeFailure(decodeFailures, e)
    }
  })
  logDecodeFailures(api, 'Raydium CP-Swap pool accounts', decodeFailures)

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
