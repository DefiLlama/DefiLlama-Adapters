const { defaultTokens } = require('../helper/cex')
const { getConfig } = require('../helper/cache')
const { getConnection } = require('../helper/solana')
const { sliceIntoChunks } = require('../helper/utils')
const { PublicKey } = require('@solana/web3.js')

// Printr contract is deployed at the same address on all EVM chains (CREATE2)
const PRINTR_CONTRACT = '0xb77726291b125515d0a7affeea2b04f2ff243172'

// Chain ID mapping for API calls
const chainIds = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  avax: 43114,
  mantle: 5000,
  monad: 143,
}

// Solana constants
const PRINTR_API = 'https://api-preview.printr.money'
const SOLANA_CHAIN_ID = 900
const WSOL = 'So11111111111111111111111111111111111111112'

// Meteora DBC VirtualPool account layout offsets (C-repr bytemuck serialization)
// Source: Meteora DBC IDL (dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN), VirtualPool type definition
// Layout: 8-byte discriminator + VolatilityTracker(64) + config/creator/mints/vaults(5×32) + reserves...
// Verified against on-chain account size of 424 bytes
const VIRTUAL_POOL_DISCRIMINATOR = [213, 224, 5, 209, 98, 69, 119, 92]
const QUOTE_RESERVE_OFFSET = 240 // u64 LE — byte 8 + struct offset 232
const IS_MIGRATED_OFFSET = 305   // u8 (0 = active, 1 = migrated) — byte 8 + struct offset 297

/**
 * Calculates TVL for Printr protocol on EVM chains
 * @param {object} api - DefiLlama SDK API object
 */
async function tvl(api) {
  const treasury = await api.call({ target: PRINTR_CONTRACT, abi: 'function treasury() view returns (address)' })
  const wNative = await api.call({ target: PRINTR_CONTRACT, abi: 'function wrappedNativeToken() view returns (address)' })
  await api.sumTokens({ owner: treasury, tokens: [wNative, ...(defaultTokens[api.chain] || [])] })
}

const PAGE_SIZE = 500

async function fetchAllSolanaTokens() {
  const tokens = []
  let skip = 0
  while (true) {
    const endpoint = `${PRINTR_API}/chains/${SOLANA_CHAIN_ID}/tokenlist.json?size=${PAGE_SIZE}&skip=${skip}`
    const data = await getConfig(`printr-protocol/${SOLANA_CHAIN_ID}/${skip}`, endpoint)
    if (!data || !Array.isArray(data.tokens)) {
      if (skip === 0) throw new Error(`Invalid token list response from ${endpoint}`)
      break
    }
    if (!data.tokens.length) break
    tokens.push(...data.tokens)
    if (data.tokens.length < PAGE_SIZE) break
    skip += PAGE_SIZE
  }
  return tokens
}

/**
 * Calculates TVL for Printr protocol on Solana
 * Reads DBC VirtualPool accounts to sum quote_reserve (wSOL) for active curves
 * @param {object} api - DefiLlama SDK API object
 */
async function solanaTvl(api) {
  const tokens = await fetchAllSolanaTokens()
  const active = tokens.filter(t => t.extensions?.curveAddress && !t.extensions?.isGraduated)
  if (!active.length) return

  const seen = new Set()
  const curveKeys = []
  for (const t of active) {
    const addr = t.extensions.curveAddress
    if (seen.has(addr)) continue
    seen.add(addr)
    try {
      curveKeys.push(new PublicKey(addr))
    } catch (e) { }
  }
  if (!curveKeys.length) return

  const connection = getConnection()
  const chunks = sliceIntoChunks(curveKeys, 100)
  for (const chunk of chunks) {
    const accounts = await connection.getMultipleAccountsInfo(chunk)

    for (const account of accounts) {
      if (!account || account.data.length < IS_MIGRATED_OFFSET + 1) continue

      const data = account.data
      const discriminatorMatch = VIRTUAL_POOL_DISCRIMINATOR.every((b, i) => data[i] === b)
      if (!discriminatorMatch) continue

      const quoteReserve = data.readBigUInt64LE(QUOTE_RESERVE_OFFSET)
      const isMigrated = data.readUInt8(IS_MIGRATED_OFFSET)

      if (isMigrated === 0 && quoteReserve > 0n) {
        api.add(WSOL, quoteReserve.toString())
      }
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: `Sum of reserves locked in active Printr bonding curves and tokens locked in Proof of Belief (POB) staking pools. Each curve holds a base pair token (e.g., USDC, USDT, USD1) that users deposit to buy tokens. Graduated tokens (curves with completionThreshold=0) are excluded as their liquidity has moved to DEX pools (Meteora on Solana, Uniswap V3 on ETH/Base/Arb/Avax, PancakeSwap V3 on BNB/Monad, Merchant Moe on Mantle). Locked POB tokens are not used as liquidity, they represent onchain commitment only.`
}

// Register TVL function for each supported EVM chain
Object.keys(chainIds).forEach(chain => {
  module.exports[chain] = { tvl }
})

// Register Solana TVL
module.exports.solana = { tvl: solanaTvl }
