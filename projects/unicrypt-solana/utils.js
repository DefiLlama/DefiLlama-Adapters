const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, decodeAccount } = require('../helper/solana')
const { TOKEN_LOCK_ACCOUNT_SIZES, TOKEN_LOCK_DISCRIMINATOR } = require('../helper/utils/solana/layouts/unicrypt-layout')

const UNCX_LP_VAULT_SEED = Buffer.from('uncx_lp_vault')

function deriveUncxVault(ammId, lockerProgramId) {
  const [vault] = PublicKey.findProgramAddressSync(
    [UNCX_LP_VAULT_SEED, new PublicKey(ammId).toBuffer()],
    new PublicKey(lockerProgramId),
  )
  return vault.toBase58()
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

function addProportionalReserves({ api, mintA, mintB, lockedLp, reserveA, reserveB, lpSupply }) {
  const amountLp = toBigInt(lockedLp)
  const amountA = toBigInt(reserveA)
  const amountB = toBigInt(reserveB)
  const supply = toBigInt(lpSupply)
  if (!mintA || !mintB || amountLp <= 0n || supply <= 0n) return

  const addA = (amountLp * amountA) / supply
  const addB = (amountLp * amountB) / supply
  if (addA > 0n) api.add(mintA, addA.toString())
  if (addB > 0n) api.add(mintB, addB.toString())
}

async function getLockerTokenLocks(programId, api, layout = 'unicryptTokenLock', dataSize = TOKEN_LOCK_ACCOUNT_SIZES[layout]) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: [
      ...(dataSize ? [{ dataSize }] : []),
      { memcmp: { offset: 0, bytes: bs58.encode(TOKEN_LOCK_DISCRIMINATOR) } },
    ],
  })
  return accounts.map(item => ({ publicKey: item.pubkey, account: decodeAccount(layout, item.account) }))
}

module.exports = {
  deriveUncxVault,
  bnToNumber,
  toBigInt,
  addProportionalReserves,
  getLockerTokenLocks,
}
