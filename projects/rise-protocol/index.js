const { getConnection, sumTokens2, getMultipleAccounts } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default

// https://github.com/riserich/rise-docs/blob/main/idl/mayflower.json#L5422
// MarketMeta layout (Anchor, 8-byte discriminator + publicKey fields):
//   8    mintMain          (32)  WSOL/USDC/etc.
//   40   mintToken         (32)
//   72   mintOptions       (32)
//   104  marketGroup       (32)  memcmp filter target (Rise group pubkey)
//   136  market            (32)
//   168  tokenProgramMain  (32)
//   200  liqVaultMain      (32)  SPL token account holding tokens

// MarketLinear layout: totalDebt is u64 at offset 56.
const MAYFLOWER = 'AVMmmRzwc2kETQNhPiFVnyu62HrgsQXTD6D7SnSfEz7v'

// Mayflower hosts other tenants too; pin to Rise's MarketGroup so we never
// accidentally count a non-Rise market.
const RISE_MARKET_GROUP = 'HA9pvTe8F2MLhQK1ZgHn7r2rfd2DJgA7NJBxDfKn9P7d'

// Anchor account discriminator for MarketMeta = sha256("account:MarketMeta")[:8].
const MARKET_META_DISC = bs58.encode(Buffer.from([95, 146, 205, 231, 152, 205, 151, 183]))

const MM_MINT_MAIN_OFFSET    = 8
const MM_MARKET_GROUP_OFFSET = 104
const MM_LIQ_VAULT_OFFSET    = 200
const ML_TOTAL_DEBT_OFFSET   = 56

const ML_PDA_SEED = Buffer.from('market_linear')

async function fetchRiseMarkets() {
  const programId = new PublicKey(MAYFLOWER)
  const connection = getConnection()

  // get mintMain + liqVaultMain per Rise market.
  const metas = await connection.getProgramAccounts(programId, {
    encoding: 'base64',
    filters: [
      { memcmp: { offset: 0, bytes: MARKET_META_DISC } },
      { memcmp: { offset: MM_MARKET_GROUP_OFFSET, bytes: RISE_MARKET_GROUP } },
    ],
    dataSlice: { offset: MM_MINT_MAIN_OFFSET, length: 224 },
  })

  return metas.map(m => {
    const data = m.account.data
    const mintMain     = new PublicKey(data.slice(0, 32)).toBase58()
    const liqVaultMain = new PublicKey(data.slice(MM_LIQ_VAULT_OFFSET - MM_MINT_MAIN_OFFSET,
                                                  MM_LIQ_VAULT_OFFSET - MM_MINT_MAIN_OFFSET + 32)).toBase58()
    const [marketLinear] = PublicKey.findProgramAddressSync(
      [ML_PDA_SEED, m.pubkey.toBuffer()],
      programId,
    )
    return { mintMain, liqVaultMain, marketLinear: marketLinear.toBase58() }
  })
}

async function tvl(api) {
  const markets = await fetchRiseMarkets()
  if (!markets.length) return
  return sumTokens2({ api, tokenAccounts: markets.map(m => m.liqVaultMain) })
}

/**
 * Borrowed: sum of MarketLinear.totalDebt across all Rise markets, denominated
 * in each market's mintMain. Debt is a pure accounting counter (no underlying
 * token account to read).
 */
async function borrowed(api) {
  const markets = await fetchRiseMarkets()
  if (!markets.length) return
  const accounts = await getMultipleAccounts(markets.map(m => m.marketLinear), { api })
  accounts.forEach((acc, i) => {
    if (!acc?.data || acc.data.length < ML_TOTAL_DEBT_OFFSET + 8) return
    const debt = acc.data.readBigUInt64LE(ML_TOTAL_DEBT_OFFSET)
    if (debt > 0n) api.add(markets[i].mintMain, debt.toString())
  })
}

module.exports = {
  timetravel: false,
  methodology: `TVL: sum of the main quote token (WSOL, USDC, etc.) actually held on-chain in each Rise market's liquidity vault (the liqVaultMain SPL token account stored on its MarketMeta). Borrowed: sum of MarketLinear.totalDebt across the same markets, representing main-token debt that users have drawn against their token collateral. Rise markets are identified on-chain by selecting Mayflower MarketMeta accounts whose marketGroup field is Rise's group pubkey (HA9pvTe8...).`,
  solana: { tvl, borrowed },
}
