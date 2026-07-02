const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, decodeAccount } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { TOKEN_LOCK_DISCRIMINATOR } = require('../helper/utils/solana/layouts/unicrypt-layout')

const PROGRAM_LOCKER_CP_SWAP = 'UNCXdvMRxvz91g3HqFmpZ5NgmL77UH4QRM4NfeL4mQB'
const PROGRAM_LOCKER_CLMM = 'UNCXrB8cZXnmtYM1aSo1Wx3pQaeSZYuF2jCTesXvECs'
const PROGRAM_LOCKER_NEW_AMM = 'UNCX77nZrA3TdAxMEggqG18xxpgiNGT6iqyynPwpoxN'
const PROGRAM_LOCKER_AMM = 'GsSCS3vPWrtJ5Y9aEVVT65fmrex5P5RGHXdZvsdbWgfo'
const PROGRAM_METEORA_LOCKER = 'uNCXmCod5WAkjfkNJPMZ9WRKDNiwQnM778RVbP17a6U'
const PROGRAM_DLMM = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'

const UNCX_LP_VAULT_SEED = Buffer.from('uncx_lp_vault')
const BIN_ARRAY_LB_PAIR_OFFSET = 24

function deriveUncxVault(ammId, lockerProgramId) {
  const ammKey = typeof ammId === 'string' ? new PublicKey(ammId) : ammId
  const [vault] = PublicKey.findProgramAddressSync(
    [UNCX_LP_VAULT_SEED, ammKey.toBuffer()],
    new PublicKey(lockerProgramId),
  )
  return vault.toBase58()
}

function getField(obj, ...keys) {
  for (const key of keys) if (obj && obj[key] !== undefined) return obj[key]
}

function toBase58(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof PublicKey) return value.toBase58()
  if (typeof value.toBase58 === 'function') return value.toBase58()
  return new PublicKey(value).toBase58()
}

function bnToNumber(v) {
  if (typeof v === 'number') return v
  if (!v) return 0
  if (typeof v === 'bigint') return Number(v)
  if (typeof v.toString === 'function') return Number(v.toString())
  if (typeof v.toNumber === 'function') return v.toNumber()
  return Number(v)
}

function toBigInt(v) {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(v)
  if (!v) return 0n
  if (typeof v.toString === 'function') return BigInt(v.toString())
  return BigInt(v)
}

function mulDiv(a, b, d) {
  if (!d || d <= 0n) return 0n
  return (a * b) / d
}

function addProportionalReserves({ api, mintA, mintB, lockedLp, reserveA, reserveB, lpSupply }) {
  const amountLp = toBigInt(lockedLp)
  const amountA = toBigInt(reserveA)
  const amountB = toBigInt(reserveB)
  const supply = toBigInt(lpSupply)
  if (!mintA || !mintB || amountLp <= 0n || supply <= 0n) return

  const addA = mulDiv(amountLp, amountA, supply)
  const addB = mulDiv(amountLp, amountB, supply)
  if (addA > 0n) api.add(mintA, addA.toString())
  if (addB > 0n) api.add(mintB, addB.toString())
}

function recordDecodeFailure(stats, error) {
  stats.count += 1
  if (!stats.reason) stats.reason = error?.message || 'decode failed'
}

function logDecodeFailures(api, label, stats) {
  if (stats.count > 0) api?.log?.(`[unicrypt-solana] skipped ${stats.count} ${label}: ${stats.reason}`)
}

async function getLockerTokenLocks(programId, layout = 'unicryptTokenLock', api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(TOKEN_LOCK_DISCRIMINATOR) } }],
  })
  const out = []
  const decodeFailures = { count: 0 }
  for (const item of accounts) {
    const data = item.account?.data
    if (!Buffer.isBuffer(data) || data.length < 8) continue
    try {
      const account = decodeAccount(layout, item.account)
      out.push({ publicKey: item.pubkey, account })
    } catch (e) {
      recordDecodeFailure(decodeFailures, e)
    }
  }
  logDecodeFailures(api, `${layout} accounts for ${programId}`, decodeFailures)
  return out
}

module.exports = {
  PROGRAM_LOCKER_CP_SWAP,
  PROGRAM_LOCKER_CLMM,
  PROGRAM_LOCKER_NEW_AMM,
  PROGRAM_LOCKER_AMM,
  PROGRAM_METEORA_LOCKER,
  PROGRAM_DLMM,
  UNCX_LP_VAULT_SEED,
  BIN_ARRAY_LB_PAIR_OFFSET,
  deriveUncxVault,
  getField,
  toBase58,
  bnToNumber,
  toBigInt,
  mulDiv,
  addProportionalReserves,
  recordDecodeFailure,
  logDecodeFailures,
  getLockerTokenLocks,
  getUniqueAddresses,
}
