const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const {
  deriveUncxVault,
  toBigInt,
  addProportionalReserves,
  getLockerTokenLocks,
} = require('./utils')

const PROGRAM_LOCKER_AMM = 'GsSCS3vPWrtJ5Y9aEVVT65fmrex5P5RGHXdZvsdbWgfo'
const PROGRAM_LOCKER_NEW_AMM = 'UNCX77nZrA3TdAxMEggqG18xxpgiNGT6iqyynPwpoxN'
const TOKEN_LOCK_SIZE_AMM = 146
const TOKEN_LOCK_SIZE_NEW_AMM = 196

async function addRaydiumAmmLocks({ api, programId, dataSize }) {
  const locks = await getLockerTokenLocks(programId, api, 'unicryptTokenLock', dataSize)
  if (!locks.length) return

  const poolIds = getUniqueAddresses(locks.map(({ account }) => account.ammId.toBase58()), 'solana')
  const uncxVaults = poolIds.map(poolId => deriveUncxVault(poolId, programId))

  const [poolInfos, lpVaultInfos] = await Promise.all([
    getMultipleAccounts([...poolIds]),
    getMultipleAccounts([...uncxVaults]),
  ])

  const pools = new Map()
  const tokenAccounts = []
  const lpMints = []

  poolIds.forEach((poolId, i) => {
    const vaultInfo = lpVaultInfos[i]
    if (!vaultInfo) return
    const lpLocked = toBigInt(decodeAccount('tokenAccount', vaultInfo).amount)
    if (lpLocked <= 0n) return

    const pool = decodeAccount('raydiumLPv4', poolInfos[i])
    const baseVault = pool.baseVault.toBase58()
    const quoteVault = pool.quoteVault.toBase58()
    const lpMint = pool.lpMint.toBase58()
    pools.set(poolId, {
      baseVault,
      quoteVault,
      lpMint,
      baseMint: pool.baseMint.toBase58(),
      quoteMint: pool.quoteMint.toBase58(),
      lpLocked,
    })
    tokenAccounts.push(baseVault, quoteVault)
    lpMints.push(lpMint)
  })
  if (!pools.size) return

  const uniqueVaults = getUniqueAddresses(tokenAccounts, 'solana')
  const uniqueMints = getUniqueAddresses(lpMints, 'solana')
  const [vaultInfos, mintInfos] = await Promise.all([
    getMultipleAccounts([...uniqueVaults]),
    getMultipleAccounts([...uniqueMints]),
  ])

  const vaultAmounts = new Map()
  uniqueVaults.forEach((vault, i) => vaultAmounts.set(vault, toBigInt(decodeAccount('tokenAccount', vaultInfos[i]).amount)))

  const lpSupplies = new Map()
  uniqueMints.forEach((mint, i) => lpSupplies.set(mint, toBigInt(decodeAccount('mint', mintInfos[i]).supply)))

  pools.forEach(({ baseVault, quoteVault, baseMint, quoteMint, lpMint, lpLocked }) => {
    const reserveA = vaultAmounts.get(baseVault)
    const reserveB = vaultAmounts.get(quoteVault)
    const lpSupply = lpSupplies.get(lpMint)
    if (reserveA === undefined || reserveB === undefined || lpSupply === undefined)
      throw new Error(`[unicrypt-solana] ${programId}: missing vault/mint state for pool lpMint=${lpMint}`)

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

  api.log(`[unicrypt-solana] ${programId}: valued ${pools.size} locked Raydium AMM pools`)
}

async function addAmmLocks(api) {
  await addRaydiumAmmLocks({ api, programId: PROGRAM_LOCKER_AMM, dataSize: TOKEN_LOCK_SIZE_AMM })
  await addRaydiumAmmLocks({ api, programId: PROGRAM_LOCKER_NEW_AMM, dataSize: TOKEN_LOCK_SIZE_NEW_AMM })
}

module.exports = {
  addAmmLocks,
}
