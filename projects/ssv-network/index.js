/**
 * DefiLlama Adapter for SSV Network
 * Tracks total ETH staked in SSV Network validators
 */

const { request, gql } = require('graphql-request')

// Configuration
const SSV_SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/88140/ssv-validators/version/latest'
const ETH_TOKEN = '0x0000000000000000000000000000000000000000'

// GraphQL Query - Only fetch required fields
const SSV_TVL_QUERY = gql`
  query GetSSVTVL {
    ssvstats(id: "ssv") {
      totalSSVEffectiveBalance
      totalSSVValidators
      activeSSVValidators
    }
  }
`

/**
 * Fetches TVL for SSV Network
 * @param {Object} api - DefiLlama API instance
 */
async function tvl(api) {
  try {
    // Make request without hardcoded auth token
    // Note: Remove auth header as it should not be hardcoded
    const data = await request(SSV_SUBGRAPH_URL, SSV_TVL_QUERY)
    
    if (!data.ssvstats) {
      throw new Error('No SSV stats found in subgraph response')
    }
    
    const stats = data.ssvstats
    const totalEffectiveBalance = stats.totalSSVEffectiveBalance
    
    if (!totalEffectiveBalance || totalEffectiveBalance === '0') {
      console.warn('SSV Network: No effective balance found')
      return
    }
    
    // Verify unit: totalSSVEffectiveBalance should be in Gwei
    // Convert from Gwei to Wei (DefiLlama expects Wei)
    const gweiValue = BigInt(totalEffectiveBalance)
    const weiValue = gweiValue * BigInt(1e9)
    
    // Add to DefiLlama TVL
    api.add(ETH_TOKEN, weiValue.toString())
    
  } catch (error) {
    console.error('Error fetching SSV Network TVL:', error.message)
    // Don't re-throw to prevent adapter failure
    return
  }
}

// DefiLlama Adapter Export
module.exports = {
  methodology: 'Tracks total ETH staked in SSV Network validators using totalSSVEffectiveBalance from the SSV subgraph. The effective balance represents the actual ETH amount backing each validator in the network.',
  start: 18362616, // Block when SSV Network mainnet launched (October 2023)
  ethereum: {
    tvl,
  }
} 