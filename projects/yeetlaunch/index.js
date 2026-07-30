const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

// YeetAMM — bonding curve and AMM in a single Solana program. A pool starts in
// DBC mode and converts in place to a constant-product AMM pool, so both stages
// hold their reserves in the same pair of program-owned token vaults.
const PROGRAM_ID = 'yeetaecvxpd7DFzZAYTEYracRt1WYJ7DfMVjEeEt2Cp'

// Anchor discriminator for the `Pool` account (sha256("account:Pool")[0..8]),
// base58-encoded for the memcmp filter. Filtering on the discriminator rather
// than on dataSize keeps this correct across pool struct versions, which have
// grown by appending fields (545 -> 577 -> 593 bytes).
const POOL_DISCRIMINATOR = 'hQrXeCntzbV'

// Byte offsets into the Pool account. These sit below 545 bytes and have not
// moved across struct versions, since newer fields were appended.
const OFFSET_VAULT_A = 74
const OFFSET_VAULT_B = 106
const OFFSET_IS_INITIALIZED = 414

async function tvl(api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR } }],
  })

  const tokenAccounts = []
  for (const { account } of accounts) {
    const data = account.data
    // Skip pools whose accounts exist but were never fully set up; their vaults
    // are empty and may not be valid token accounts yet.
    if (data.length <= OFFSET_IS_INITIALIZED || data[OFFSET_IS_INITIALIZED] !== 1) continue
    tokenAccounts.push(new PublicKey(data.subarray(OFFSET_VAULT_A, OFFSET_VAULT_A + 32)).toString())
    tokenAccounts.push(new PublicKey(data.subarray(OFFSET_VAULT_B, OFFSET_VAULT_B + 32)).toString())
  }

  // Balances come from the vaults themselves, never from the pool's bookkept
  // reserve fields. Pools also carry virtual reserves used only to shape the
  // bonding curve price; those are not assets and must not be counted. Reading
  // the vaults excludes them structurally rather than by subtraction.
  return sumTokens2({ api, tokenAccounts, onlyTrustedTokens: true })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the balance of the SOL-side and token-side vaults owned by the YeetAMM program (yeetaecvxpd7DFzZAYTEYracRt1WYJ7DfMVjEeEt2Cp), covering both bonding-curve pools and graduated AMM pools. Pool accounts are discovered on-chain by their Anchor discriminator and vault balances are read directly from the token accounts. Virtual reserves, which the program stores to shape the bonding curve price but which hold no assets, are excluded. Newly launched tokens with no external market are not counted, as only trusted/priced tokens contribute.',
  solana: { tvl },
}
