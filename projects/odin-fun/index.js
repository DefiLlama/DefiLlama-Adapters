const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL includes Bitcoin and runes deposited and locked in trading pools and bonding curves.",
  bitcoin: { tvl },
}

async function tvl() {
    const response = await get('https://api.odin.fun/v1/statistics/dashboard/')
    
    if (!response || typeof response.total_value_tokens === 'undefined') {
      console.warn('Could not fetch total_value_tokens from Odin API')
      return {}
    }

    // Convert total_value_tokens (in mili satoshis) to sats
    const totalValueMilliSatoshis = response.total_value_tokens
    const sats = totalValueMilliSatoshis / 1e3
  
    return {
      'coingecko:bitcoin': sats / 1e8
    }
} 