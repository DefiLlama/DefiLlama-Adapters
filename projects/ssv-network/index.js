/**
 * DefiLlama Adapter for SSV Network
 * Tracks total ETH staked in SSV Network validators via official API
 */

const { get } = require('../helper/http')

// Configuration
const SSV_API_URL = 'https://api.ssv.network/api/v4/mainnet/statistics/totalEffectiveBalance'
const ETH_TOKEN = '0x0000000000000000000000000000000000000000'

/**
 * Fetches TVL for SSV Network
 * @param {Object} api - DefiLlama API instance
 */
async function tvl(api) {
  try {
    // Fetch total effective balance from official API
    // Returns: {"total_effective_balance": "4769351000000000"} (in Gwei)
    const data = await get(SSV_API_URL)

    if (!data || !data.total_effective_balance) {
      throw new Error('Invalid response format or missing total_effective_balance')
    }

    const totalEffectiveBalanceGwei = data.total_effective_balance

    // api.add handles big number arithmetic safely
    // Input is Gwei (1e9), output needed in Wei (1e18)
    // We multiply by 1e9 to convert Gwei to Wei
    api.add(ETH_TOKEN, totalEffectiveBalanceGwei + '000000000')

  } catch (error) {
    console.error('Error fetching SSV Network TVL:', error.message)
    return
  }
}

module.exports = {
  methodology: 'Tracks total ETH staked in SSV Network validators using the official SSV Network API (totalEffectiveBalance).',
  start: 18362616, // Block when SSV Network mainnet launched (October 2023)
  ethereum: {
    tvl,
  }
}
