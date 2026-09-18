const { PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')
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
const OFFSET_MINT_A = 10
const OFFSET_MINT_B = 42
const OFFSET_VAULT_A = 74
const OFFSET_VAULT_B = 106
const OFFSET_IS_INITIALIZED = 414

const QUOTE_MINTS = new Set([
  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDC,
  ADDRESSES.solana.USDT,
])

async function tvl(api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR } }],
  })

  const tokenAccounts = []
  for (const { account } of accounts) {
    const data = account.data
    // Skip uninitialized pools; their vaults are empty and may not be valid token accounts yet.
    if (data.length <= OFFSET_IS_INITIALIZED || data[OFFSET_IS_INITIALIZED] !== 1) continue

    const readPubkey = (offset) => new PublicKey(data.subarray(offset, offset + 32)).toString()
    const sides = [[OFFSET_MINT_A, OFFSET_VAULT_A], [OFFSET_MINT_B, OFFSET_VAULT_B]]
    for (const [mintOffset, vaultOffset] of sides) {
      if (!QUOTE_MINTS.has(readPubkey(mintOffset))) continue
      tokenAccounts.push(readPubkey(vaultOffset))
    }
  }

  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the quote-asset (SOL/USDC/USDT) balance held in the YeetAMM program vaults, covering both bonding-curve and graduated AMM pools (which share the same vaults). Only the quote side of each pool is counted, so freshly launched tokens — which have no market outside their own pool — are not assigned value.',
  solana: { tvl },
}
