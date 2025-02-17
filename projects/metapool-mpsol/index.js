const { getTokenSupplies } = require('../helper/solana')
const { Connection, PublicKey } = require('@solana/web3.js')
const axios = require('axios')

// ===================== CONSTANTS =====================
// Mint address of mpSOL token on Solana
const MPSOL_MINT = 'mPsoLV53uAGXnPJw63W91t2VDqCVZcU5rTh3PWzxnLr'

// Public key of the MainVaultState account on Solana (program state)
const STATE_ACCOUNT_PUBKEY = new PublicKey('mpsoLeuCF3LwrJWbzxNd81xRafePFfPhsNvGsAMhUAA')

// RPC endpoint for connecting to the Solana network (using Dialect RPC)
const RPC_URL = process.env.SOLANA_RPC
// ===================== FETCH SOL PRICE =====================
/**
 * Fetches the current price of SOL in USD from CoinGecko.
 * 
 * @param {Object} api - DefiLlama API context (optional)
 * @returns {Promise<number>} - SOL price in USD
 */
async function getSolPrice(api) {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    const response = await axios.get(url)
    //console.log("Esto es response.data", response.data)
    return response.data.solana?.usd ?? 0
  } catch (error) {
    console.error('Error fetching SOL price:', error.message)
    return 0
  }
}

// ===================== FETCH MPSOL SUPPLY =====================
/**
 * Fetches the on-chain supply of the mpSOL token.
 * It queries the supply of the mint address via getTokenSupplies helper.
 * 
 * @returns {Promise<number>} - mpSOL supply
 */
async function getMpsolSupply() {
  const supplyInfo = await getTokenSupplies([MPSOL_MINT])
  return supplyInfo[MPSOL_MINT]
}

// ===================== FETCH BACKING_SOL_VALUE =====================
/**
 * Fetches the backing_sol_value from the on-chain MainVaultState account.
 * backing_sol_value is stored as u64 (8 bytes) at offset 171 within the account data.
 * It represents the amount of SOL (in lamports) backing the mpSOL supply.
 * 
 * @returns {Promise<number>} - backing_sol_value in SOL
 */
async function getBackingSolValue() {
  const connection = new Connection(RPC_URL)
  const accountInfo = await connection.getAccountInfo(STATE_ACCOUNT_PUBKEY)
  if (!accountInfo) {
    throw new Error('Failed to fetch MainVaultState account')
  }

  const data = accountInfo.data
  // Read 8 bytes from offset 171 (little-endian) -> u64 value in lamports
  const backingSolValueLamports = data.readBigUInt64LE(171)
  // Convert from lamports (1 SOL = 1e9 lamports) to SOL
  const backingSolValueSOL = Number(backingSolValueLamports) / 1e9

  return backingSolValueSOL
}

// ===================== TVL CALCULATION =====================
/**
 * Calculates the TVL (Total Value Locked) in USD.
 * TVL is computed as:
 * 1. Fetch mpSOL supply from on-chain.
 * 2. Fetch backing_sol_value from the state account.
 * 3. Fetch current SOL price in USD.
 * 4. Calculate mpSOL exchange rate: backing_sol_value / mpSOL supply.
 * 5. Derive mpSOL price in USD: exchange_rate * SOL price.
 * 6. Compute TVL in USD: mpSOL supply * mpSOL price in USD.
 * 
 * @param {Object} api - DefiLlama API context (optional)
 * @returns {Promise<{usd: number}>} - TVL in USD
 */
async function tvl(api) {
  // Fetch all necessary data in parallel (performance optimization)
  const [solPrice, mpsolSupply, backingSolValueSOL] = await Promise.all([
    getSolPrice(api),
    getMpsolSupply(),
    getBackingSolValue(),
  ])

  if (!mpsolSupply) throw new Error('Failed to fetch mpSOL supply')

  // Calculate exchange rate: how much SOL backs 1 mpSOL
  const exchangeRate = backingSolValueSOL / mpsolSupply

  // Calculate mpSOL price in USD
  const mpSolPriceUsd = exchangeRate * solPrice

  // Calculate TVL in USD (supply * mpSOL price)
  const tvlUsd = mpsolSupply * mpSolPriceUsd

  // Log results for debugging purposes
/*   console.log(`SOL Price: $${solPrice}`)
  console.log(`mpSOL Supply: ${mpsolSupply}`)
  console.log(`backing_sol_value (SOL): ${backingSolValueSOL}`)
  console.log(`Exchange Rate (SOL per mpSOL): ${exchangeRate}`)
  console.log(`mpSOL Price (USD): $${mpSolPriceUsd}`)
  console.log(`TVL (USD): $${tvlUsd}`) */

  return { usd: tvlUsd }
}

// ===================== MODULE EXPORT =====================
module.exports = {
  timetravel: false,
  methodology:
    'TVL is calculated by multiplying the mpSOL supply by its derived price in USD, using the backing_sol_value from the on-chain MainVaultState account and the price of SOL from CoinGecko.',
  solana: {
    tvl,
  },
}
