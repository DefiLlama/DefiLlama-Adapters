// DiversiFi — DeFiLlama TVL adapter
// Target file location in the PR: projects/diversifi/index.js
//
// Structure discovered on-chain (Solana mainnet):
//   Program:  3vyr9DRfMZb2KvUQdnps7YG3PY38XdguLBQaJ2DFkSxk   (executable, BPF upgradeable)
//   Vaults:   program-owned accounts of size 246 bytes. Each vault account IS the
//             token authority — it directly owns the SPL / Token-2022 accounts that
//             custody the underlying assets. Vaults are user-creatable, so the set is
//             not static: we re-enumerate them on every run (getProgramAccounts), which
//             means new vaults are picked up automatically with no code changes.
//   Product mint of each vault: bytes [33..65) of the vault account data. These are
//             DiversiFi's own index tokens; since vaults can hold each other's index
//             tokens (fund-of-funds), we blacklist every product mint so underlying
//             assets are counted once, never the wrapper on top of them.

const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = '3vyr9DRfMZb2KvUQdnps7YG3PY38XdguLBQaJ2DFkSxk'
const VAULT_ACCOUNT_SIZE = 246
const PRODUCT_MINT_OFFSET = 33

// Perena USD* is a yield-BEARING stablecoin that DeFiLlama's oracle does not price yet.
// It is NOT $1 — it appreciates as yield accrues (≈$1.081 today). We convert the held
// USD* balance into its USDC-equivalent using the pool's on-chain virtual price, so the
// value is accurate today and self-updates as the rate grows (no hardcoded price).
//   USD* mint  : star9agSpjiFe3M49B3RniVU4CMBBEK3Qnaqn3RGiFM (6 decimals)
//   USDC mint  : EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (6 decimals)
//   Pool state : sM6P4mh53CnG4faN4Fo3seY7wMSAiHdy8o6gKjwQF7A (Perena Numéraire seed,
//                owned by save8RQVPMWNTzU18t3GBvBkN9hT7jsGjiCQ28FpD9H; also USD* mint auth)
//   Rate field : u64 LE at byte 352 = USDC-per-USD* scaled 1e6 (e.g. 1081226 => 1.081226)
const USD_STAR = 'solana:star9agSpjiFe3M49B3RniVU4CMBBEK3Qnaqn3RGiFM'
const USDC = 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USD_STAR_POOL = 'sM6P4mh53CnG4faN4Fo3seY7wMSAiHdy8o6gKjwQF7A'
const USD_STAR_RATE_OFFSET = 352
const RATE_SCALE = 1000000n

// USDC-per-USD* (scaled 1e6) read live from the pool; falls back to 1:1 if unreadable or
// out of a sane band, so TVL can never crash or blow up on a layout change.
async function getUsdStarRate() {
  try {
    const connection = getConnection()
    const info = await connection.getAccountInfo(new PublicKey(USD_STAR_POOL))
    const rate6 = info.data.readBigUInt64LE(USD_STAR_RATE_OFFSET)
    if (rate6 >= RATE_SCALE && rate6 < 2n * RATE_SCALE) return rate6
  } catch (e) { /* fall through to 1:1 */ }
  return RATE_SCALE
}

// minimal base58 (avoid adding npm deps — DeFiLlama rejects extra packages)
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function bs58encode(bytes) {
  let n = 0n
  for (const b of bytes) n = n * 256n + BigInt(b)
  let out = ''
  while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n }
  for (const b of bytes) { if (b === 0) out = '1' + out; else break }
  return out
}

async function getVaults() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ dataSize: VAULT_ACCOUNT_SIZE }],
  })
  const owners = []
  const blacklistedTokens = new Set()
  for (const { pubkey, account } of accounts) {
    owners.push(pubkey.toString())
    const mint = account.data.slice(PRODUCT_MINT_OFFSET, PRODUCT_MINT_OFFSET + 32)
    blacklistedTokens.add(bs58encode(mint))
  }
  return { owners, blacklistedTokens: [...blacklistedTokens] }
}

async function tvl(api) {
  const { owners, blacklistedTokens } = await getVaults()
  const balances = await sumTokens2({ api, owners, blacklistedTokens })
  // Convert held USD* into its USDC-equivalent at the live on-chain rate (both 6 decimals).
  if (balances[USD_STAR]) {
    const rate6 = await getUsdStarRate()
    const usdcRaw = (BigInt(balances[USD_STAR]) * rate6 / RATE_SCALE).toString()
    sdk.util.sumSingleBalance(balances, USDC, usdcRaw)
    delete balances[USD_STAR]
  }
  return balances
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the value of all underlying assets custodied in DiversiFi vault accounts on ' +
    'Solana. Vaults are discovered on-chain from the DiversiFi program on every run, so ' +
    'user-created vaults are included automatically. Each vault’s own index-token mint is ' +
    'blacklisted so vault-of-vault holdings are not double-counted. Perena USD* — a ' +
    'yield-bearing stablecoin DeFiLlama does not yet price — is converted to its ' +
    'USDC-equivalent using the pool’s live on-chain virtual price.',
  // Closed-beta launch (first real TVL). Refine to the exact day if known.
  start: '2025-12-01',
  solana: {
    tvl,
  },
}
