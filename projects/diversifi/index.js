// DiversiFi — DeFiLlama TVL adapter
// Target file location in the PR: projects/diversifi/index.js
//
// Structure discovered on-chain (Solana mainnet):
//   Program : 3vyr9DRfMZb2KvUQdnps7YG3PY38XdguLBQaJ2DFkSxk (executable, BPF upgradeable)
//   Vaults  : program-owned accounts of size 246 bytes. Vaults are user-creatable, so the
//             set is dynamic — we re-enumerate every run via getProgramAccounts.
//   Layout  : each vault stores up to 6 mint pubkeys at fixed offsets:
//               - offset 33  = the vault's own index-token mint (blacklisted below)
//               - offsets 76/110/144/178/212 = constituent asset mints (may be empty)
//             The vault directly owns the assets in the Associated Token Account of
//             (vault, mint). USDC is the settlement currency and is held outside the mint
//             slots, so we always include the vault's USDC ATA too.
//
// Why ATAs instead of getTokenAccountsByOwner: the public Solana RPC used by CI hard-rate-
// limits getTokenAccountsByOwner (429). Deriving ATAs and summing them via sumTokens2's
// tokenAccounts path uses getMultipleAccounts, which is not rate-limited — so this runs
// reliably. allowError:true tolerates ATAs that don't exist (empty slots / wrong token
// program), and blacklisting the index mints prevents double-counting the fund-of-funds
// holdings (a vault holding another vault's index token).

const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const {
  getConnection, sumTokens2, getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID,
} = require('../helper/solana')

const PROGRAM_ID = '3vyr9DRfMZb2KvUQdnps7YG3PY38XdguLBQaJ2DFkSxk'
const VAULT_ACCOUNT_SIZE = 246
const PRODUCT_MINT_OFFSET = 33
const MINT_SLOT_OFFSETS = [33, 76, 110, 144, 178, 212]
const EMPTY_MINT = '11111111111111111111111111111111' // all-zero pubkey = unused slot
// Settlement currencies held outside the mint slots (empirically only USDC today; USDT
// kept as cheap insurance — a non-existent ATA is simply skipped via allowError).
const BASE_MINTS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
]


// minimal base58 encoder (avoid adding npm deps — DeFiLlama rejects extra packages)
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function bs58encode(bytes) {
  let n = 0n
  for (const b of bytes) n = n * 256n + BigInt(b)
  let out = ''
  while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n }
  for (const b of bytes) { if (b === 0) out = '1' + out; else break }
  return out
}

async function getVaultTokenAccounts() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ dataSize: VAULT_ACCOUNT_SIZE }],
  })
  const tokenAccounts = new Set()
  const blacklistedTokens = new Set()
  for (const { pubkey, account } of accounts) {
    const owner = pubkey.toString()
    // vault's own index-token mint -> blacklist so fund-of-funds holdings aren't double counted
    blacklistedTokens.add(bs58encode(account.data.slice(PRODUCT_MINT_OFFSET, PRODUCT_MINT_OFFSET + 32)))
    // each mint slot -> ATA(vault, mint) under both token programs (allowError skips misses)
    for (const off of MINT_SLOT_OFFSETS) {
      const mint = bs58encode(account.data.slice(off, off + 32))
      if (mint === EMPTY_MINT) continue
      tokenAccounts.add(getAssociatedTokenAddress(mint, owner, TOKEN_PROGRAM_ID))
      tokenAccounts.add(getAssociatedTokenAddress(mint, owner, TOKEN_2022_PROGRAM_ID))
    }
    // settlement currency (USDC/USDT) held outside the mint slots
    for (const mint of BASE_MINTS) {
      tokenAccounts.add(getAssociatedTokenAddress(mint, owner, TOKEN_PROGRAM_ID))
    }
  }
  return { tokenAccounts: [...tokenAccounts], blacklistedTokens: [...blacklistedTokens] }
}

async function tvl(api) {
  const { tokenAccounts, blacklistedTokens } = await getVaultTokenAccounts()
  return sumTokens2({ api, tokenAccounts, blacklistedTokens, allowError: true })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the value of all underlying assets custodied in DiversiFi vault accounts on Solana',
  // Closed-beta launch (first real TVL). Refine to the exact day if known.
  start: '2025-12-01',
  solana: {
    tvl,
  },
}
