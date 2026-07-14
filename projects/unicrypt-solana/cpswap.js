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

  const pools = new Map()
  const tokenVaultAccounts = []

  poolIds.forEach((poolId, i) => {
    const vaultInfo = lpVaultInfos[i]
    if (!vaultInfo) return
    const lpLocked = toBigInt(decodeAccount('tokenAccount', vaultInfo).amount)
    if (lpLocked <= 0n) return

    const pool = decodeAccount('raydiumCpSwapPoolState', poolInfos[i])
    const lpSupply = toBigInt(pool.lpSupply)
    if (lpSupply <= 0n) return
    const token0Vault = pool.token0Vault.toBase58()
    const token1Vault = pool.token1Vault.toBase58()
    pools.set(poolId, {
      token0Vault,
      token1Vault,
      token0Mint: pool.token0Mint.toBase58(),
      token1Mint: pool.token1Mint.toBase58(),
      lpSupply,
      lpLocked,
    })
    tokenVaultAccounts.push(token0Vault, token1Vault)
  })
  if (!pools.size) return

  const uniqueTokenVaults = getUniqueAddresses(tokenVaultAccounts, 'solana')
  const tokenVaultInfos = await getMultipleAccounts([...uniqueTokenVaults])
  const tokenVaultAmounts = new Map()
  uniqueTokenVaults.forEach((vault, i) => tokenVaultAmounts.set(vault, toBigInt(decodeAccount('tokenAccount', tokenVaultInfos[i]).amount)))

  pools.forEach(({ token0Vault, token1Vault, token0Mint, token1Mint, lpSupply, lpLocked }) => {
    const reserve0 = tokenVaultAmounts.get(token0Vault)
    const reserve1 = tokenVaultAmounts.get(token1Vault)
    if (reserve0 === undefined || reserve1 === undefined)
      throw new Error(`[unicrypt-solana] ${PROGRAM_LOCKER_CP_SWAP}: missing token vault state for pool token0Mint=${token0Mint}`)

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

  api.log(`[unicrypt-solana] ${PROGRAM_LOCKER_CP_SWAP}: valued ${pools.size} locked Raydium CP-Swap pools`)
}

module.exports = {
  addCpSwapLocks,
}
