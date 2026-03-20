const http = require('../../http')

const HEDERA_MIRROR_NODE_URL = 'https://mainnet-public.mirrornode.hedera.com'

/**
 * Gets the total supply for a specific Hedera token
 * @param {string} tokenId - The token ID in Hedera format (e.g., "0.0.123456")
 * @returns {Promise<number>} - The total supply adjusted for decimals
 */
async function getHederaTokenSupply(tokenId) {
  try {
    // Ensure the token ID is properly formatted
    const formattedTokenId = tokenId.includes('.') ? tokenId : `0.0.${tokenId}`
    
    // Fetch token data from Hedera Mirror Node
    const tokenData = await http.get(`${HEDERA_MIRROR_NODE_URL}/api/v1/tokens/${formattedTokenId}`)
    
    if (!tokenData) {
      console.error(`Token ${formattedTokenId} not found`)
      return 0
    }
    
    // Calculate the actual total supply based on decimals
    const decimals = tokenData.decimals || 0
    const totalSupply = tokenData.total_supply ? (tokenData.total_supply / (10 ** decimals)) : 0
    
    return totalSupply
  } catch (error) {
    console.error(`Error fetching supply for token ${tokenId}:`, error)
    return 0
  }
}

module.exports = {
  getHederaTokenSupply
}
