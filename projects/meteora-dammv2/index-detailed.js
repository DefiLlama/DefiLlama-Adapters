// ALTERNATIVE IMPLEMENTATION: Detailed pool-by-pool TVL calculation
// This file is NOT used in production. Use index.js for standard TVL tracking.
//
// Use this implementation when you need to:
// - Filter TVL by specific launchpad creators (Believe, Bags, etc.)
// - Get granular pool-level data
// - Calculate TVL for a subset of pools
//
// Note: This approach is slower as it paginates through 132k+ pools.
// The standard implementation (index.js) uses the global metrics API instead.

const { sumTokens2 } = require('../helper/solana')
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')

const METEORA_API = 'https://dammv2-api.meteora.ag'
const SYSTEM_PROGRAM = '11111111111111111111111111111111'

// https://docs.meteora.ag/api-reference/damm-v2/overview
async function tvl() {
  if (!getEnv('IS_RUN_FROM_CUSTOM_JOB')) throw new Error('This job is not meant to be run directly, please use the custom job feature')
  const allVaults = []
  let page = 1
  let hasMore = true
  const pageSize = 100 // Max page size to reduce API calls

  // Fetch all pools from Meteora API with pagination
  while (hasMore) {
    const response = await get(`${METEORA_API}/pools?page=${page}&limit=${pageSize}`)

    const pools = response.data || []

    for (const pool of pools) {
      const { token_a_vault, token_b_vault, token_a_amount, token_b_amount } = pool

      // Skip pools with no tokens (empty/closed pools)
      if (token_a_amount === 0 && token_b_amount === 0) continue

      // Skip system program addresses (uninitialized/closed pools)
      if (token_a_vault && token_a_vault !== SYSTEM_PROGRAM) {
        allVaults.push(token_a_vault)
      }
      if (token_b_vault && token_b_vault !== SYSTEM_PROGRAM) {
        allVaults.push(token_b_vault)
      }
    }

    // Check if there are more pages
    hasMore = page < response.pages
    page++
  }

  return sumTokens2({ tokenAccounts: allVaults })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: { tvl, },
}
