// DefiLlama adapter for Caged (https://cagedballs.fun) — Solana token locker that keeps
// pump.fun / stonk.fun holder rewards flowing to locked tokens.
// Destination: DefiLlama/DefiLlama-Adapters/projects/caged/index.js
const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = new PublicKey('65cX8gGch8x4vQvU4gnpPcepwKadDSAtJ4ZgZg3hp61t')
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
// Lock account: 8-byte discriminator, then owner(32) mint(32) token_program(32) vault_authority(32)
// lock_id(8) amount(8) unlock_ts(8) created_ts(8) withdrawn(1) ...
const LOCK_DISCRIMINATOR = Buffer.from([8, 255, 36, 202, 210, 22, 57, 137])
const OFF_MINT = 40, OFF_TOKEN_PROGRAM = 72, OFF_VAULT_AUTHORITY = 104, OFF_WITHDRAWN = 168

async function tvl(api) {
  const accounts = await getConnection().getProgramAccounts(PROGRAM_ID, {
    dataSlice: { offset: 0, length: OFF_WITHDRAWN + 1 },
    filters: [{ memcmp: { offset: 0, bytes: LOCK_DISCRIMINATOR.toString('base64'), encoding: 'base64' } }],
  })
  const tokenAccounts = []
  for (const { account: { data } } of accounts) {
    if (data[OFF_WITHDRAWN] !== 0) continue // tokens already returned to the owner
    const mint = new PublicKey(data.subarray(OFF_MINT, OFF_MINT + 32))
    const tokenProgram = new PublicKey(data.subarray(OFF_TOKEN_PROGRAM, OFF_TOKEN_PROGRAM + 32))
    const vaultAuthority = new PublicKey(data.subarray(OFF_VAULT_AUTHORITY, OFF_VAULT_AUTHORITY + 32))
    // the vault is the associated token account of the lock's holder address (PDA or custody key)
    const [vault] = PublicKey.findProgramAddressSync(
      [vaultAuthority.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM,
    )
    tokenAccounts.push(vault.toBase58())
  }
  return sumTokens2({ api, tokenAccounts: [...new Set(tokenAccounts)], allowError: true })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of every token still held in a Caged lock vault. Locks are read from the program\'s Lock accounts; each vault is the associated token account of the lock\'s holder address (a PDA for trustless locks, a custody key for reward-eligible locks). Withdrawn locks are excluded.',
  solana: { tvl },
}
