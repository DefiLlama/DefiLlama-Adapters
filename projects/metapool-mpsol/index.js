const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')

// ===================== CONSTANTS =====================
// Mint address of mpSOL token on Solana
const MPSOL_MINT = 'mPsoLV53uAGXnPJw63W91t2VDqCVZcU5rTh3PWzxnLr'

// Public key of the MainVaultState account on Solana (program state)
const STATE_ACCOUNT_PUBKEY = new PublicKey('mpsoLeuCF3LwrJWbzxNd81xRafePFfPhsNvGsAMhUAA')


// ===================== FETCH BACKING_SOL_VALUE =====================
/**
 * Fetches the backing_sol_value from the on-chain MainVaultState account.
 * backing_sol_value is stored as u64 (8 bytes) at offset 171 within the account data.
 * It represents the amount of SOL (in lamports) backing the mpSOL supply.
 * 
 */
async function getBackingSolValue(api) {
  const connection = getConnection()
  const accountInfo = await connection.getAccountInfo(STATE_ACCOUNT_PUBKEY)
  const data = accountInfo.data
  // Read 8 bytes from offset 171 (little-endian) -> u64 value in lamports
  const backingSolValueLamports = data.readBigUInt64LE(171)
  api.add(ADDRESSES.solana.SOL, backingSolValueLamports)
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
 */
async function tvl(api) {
  await getBackingSolValue(api)
}

// ===================== MODULE EXPORT =====================
module.exports = {
  timetravel: false,
  doublecounted: true,  // due to looping: https://github.com/DefiLlama/DefiLlama-Adapters/pull/13421#issuecomment-2652334855
  methodology:
    'TVL is fetched by querying the amount of SOL backing the mpSOL supply on Solana.',
  solana: {
    tvl,
  },
}
