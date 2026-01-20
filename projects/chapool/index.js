const axios = require('axios')
const sdk = require('@defillama/sdk')

// BailError class to short-circuit retries
class BailError extends Error {
  constructor(originalError) {
    super(originalError.message)
    this.name = 'BailError'
    this.originalError = originalError
  }
}

// Simple retry function
async function retry(fn, { retries = 3, minTimeout = 2000 } = {}) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn((err) => {
        throw new BailError(err)
      })
    } catch (e) {
      // If it's a BailError, immediately rethrow the original error
      if (e instanceof BailError) {
        throw e.originalError
      }
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, minTimeout))
    }
  }
}

// CPNFT contract address
const CPNFT_CONTRACT = '0x2d3A1b0fD28D8358643b4822B475bF435F2611cb'

// SQL query for TVL calculation - returns staked counts by level
// Fixed: Group by token_id only to correctly handle unstaked NFTs
const TVL_SQL = `
WITH staking_events AS (
    SELECT 
        varbinary_to_uint256(topic2) as token_id,
        CAST(varbinary_to_uint256(bytearray_substring(data, 1, 32)) AS INTEGER) as level,
        'STAKE' as action
    FROM opbnb.logs
    WHERE 
        contract_address = 0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37
        AND topic0 = 0xb7f42a117a7de13499e08cdb12729b20c510b7f623fc79fec9e8bfbe1a024487
        AND block_number >= 92328871
    
    UNION ALL
    
    SELECT 
        varbinary_to_uint256(topic2) as token_id,
        NULL as level,
        'UNSTAKE' as action
    FROM opbnb.logs
    WHERE 
        contract_address = 0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37
        AND topic0 = 0x84bcc89bc1b3cb66a2b22a282fa6e1bb013db80ebce0e9c70f9beba416ac2b70
),
current_staked AS (
    SELECT 
        token_id,
        MAX(CASE WHEN action = 'STAKE' THEN level END) as level,
        SUM(CASE WHEN action = 'STAKE' THEN 1 ELSE -1 END) as net_staked
    FROM staking_events
    GROUP BY token_id
    HAVING SUM(CASE WHEN action = 'STAKE' THEN 1 ELSE -1 END) > 0
),
staked_by_level AS (
    SELECT 
        level,
        COUNT(*) as staked_count
    FROM current_staked
    WHERE level IS NOT NULL
    GROUP BY level
)
SELECT 
    level,
    staked_count
FROM staked_by_level
ORDER BY level
`

async function executeDuneSQL(sql, apiKey) {
  // Step 1: Execute SQL query
  let executeResponse
  try {
    executeResponse = await axios.post(
      'https://api.dune.com/api/v1/sql/execute',
      {
        sql: sql.trim(),
        performance: 'medium'
      },
      {
        headers: { 'X-Dune-Api-Key': apiKey },
        timeout: 30000
      }
    )
  } catch (e) {
    sdk.log('Failed to execute Dune SQL:', e.message)
    throw new Error(`Failed to execute Dune query: ${e.response?.data?.message || e.message}`)
  }

  if (!executeResponse?.data?.execution_id) {
    throw new Error('Failed to get execution_id from Dune API response')
  }

  const executionId = executeResponse.data.execution_id

  // Step 2: Poll for execution status
  const maxAttempts = 30
  const pollInterval = 3000 // 3 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait before checking status (except first attempt)
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, pollInterval))
    }

    let statusResponse
    try {
      statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        {
          headers: { 'X-Dune-Api-Key': apiKey },
          timeout: 10000
        }
      )
    } catch (e) {
      sdk.log('Failed to check Dune execution status:', e.message)
      throw new Error(`Failed to check query status: ${e.response?.data?.message || e.message}`)
    }

    if (!statusResponse?.data) {
      throw new Error('Invalid status response from Dune API')
    }

    const state = statusResponse.data.state

    if (state === 'QUERY_STATE_COMPLETED') {
      // Step 3: Get results
      let resultsResponse
      try {
        resultsResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          {
            headers: { 'X-Dune-Api-Key': apiKey },
            timeout: 10000
          }
        )
      } catch (e) {
        sdk.log('Failed to get Dune query results:', e.message)
        throw new Error(`Failed to get query results: ${e.response?.data?.message || e.message}`)
      }

      if (!resultsResponse?.data) {
        throw new Error('Invalid results response from Dune API')
      }

      return resultsResponse.data
    } else if (state === 'QUERY_STATE_FAILED') {
      const errorMsg = statusResponse.data.error || 'Unknown error'
      throw new Error(`Dune query execution failed: ${errorMsg}`)
    } else if (state === 'QUERY_STATE_PENDING' || state === 'QUERY_STATE_EXECUTING') {
      // Continue polling
      continue
    } else {
      throw new Error(`Unknown query state: ${state}`)
    }
  }

  throw new Error(`Query execution timeout after ${maxAttempts} attempts`)
}

async function tvl(api) {
  const apiKey = process.env.DUNE_API_KEY

  if (!apiKey) {
    throw new Error('DUNE_API_KEY is missing')
  }
  
  // Step 1: Get staked counts by level from Dune
  const result = await retry(async bail => {
    try {
      return await executeDuneSQL(TVL_SQL, apiKey)
    } catch (e) {
      sdk.log('Dune API Error:', e.message)
      // Bail only for permanent, non-retryable errors
      const errorMsg = e.message.toLowerCase()
      if (
        errorMsg.includes('invalid') ||
        errorMsg.includes('unauthorized') ||
        errorMsg.includes('malformed sql') ||
        errorMsg.includes('api key') ||
        errorMsg.includes('authentication')
      ) {
        bail(e)
      }
      // For transient errors (timeout, failed), retry by throwing
      throw e
    }
  }, { retries: 3, minTimeout: 2000 })

  if (!result?.result?.rows) {
    sdk.log('No data returned from Dune query')
    return api.getBalances()
  }

  const rows = result.result.rows
  if (rows.length === 0) {
    sdk.log('Empty result set from Dune query')
    return api.getBalances()
  }

  // Step 2: Get prices for each level from the contract
  // NFTLevel enum values: 1-6 (C, B, A, S, SS, SSS)
  const MAX_NFT_LEVEL = 6
  const MIN_NFT_LEVEL = 1
  const levels = rows
    .map(row => {
      const level = parseInt(row.level, 10)
      return isNaN(level) ? null : level
    })
    .filter(level => 
      level !== null && 
      Number.isInteger(level) && 
      level >= MIN_NFT_LEVEL && 
      level <= MAX_NFT_LEVEL
    )
  
  if (levels.length === 0) {
    sdk.log('No valid levels found in Dune query results')
    return api.getBalances()
  }

  const uniqueLevels = [...new Set(levels)].sort((a, b) => a - b)
  
  const prices = await api.multiCall({
    target: CPNFT_CONTRACT,
    abi: 'function getLevelPrice(uint8) external pure returns (uint256)',
    calls: uniqueLevels.map(level => ({ params: [level] }))
  })

  // Step 3: Create a price map
  // Price is returned from contract in USDT format (6 decimals)
  // e.g., 5 USDT = 5000000, 15 USDT = 15000000, etc.
  const priceMap = {}
  uniqueLevels.forEach((level, index) => {
    const priceRaw = BigInt(prices[index])
    priceMap[level] = Number(priceRaw) / 1e6 // Convert from 6 decimals to USDT
  })

  // Step 4: Calculate total TVL
  let totalUsd = 0
  for (const row of rows) {
    const level = parseInt(row.level, 10)
    const stakedCount = parseInt(row.staked_count, 10)
    
    if (isNaN(level) || isNaN(stakedCount) || stakedCount <= 0) {
      sdk.log(`Invalid row data: level=${row.level}, staked_count=${row.staked_count}`)
      continue
    }
    
    const price = priceMap[level]
    
    if (!price || price <= 0 || isNaN(price)) {
      sdk.log(`Invalid price for level ${level}: ${price}`)
      continue
    }
    
    totalUsd += stakedCount * price
  }
  
  if (totalUsd <= 0 || isNaN(totalUsd)) {
    sdk.log('No valid TVL calculated')
    return api.getBalances()
  }
  
  // Use USDT on Ethereum (6 decimals) to represent USD value
  const balances = api.getBalances()
  sdk.util.sumSingleBalance(
      balances, 
      'ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      Math.floor(totalUsd * 1e6)
  )
  
  return balances
}

module.exports = {
  methodology: 'TVL is calculated by fetching staked NFT counts by level from Dune Analytics and multiplying by prices fetched from the CPNFT contract\'s getLevelPrice() method. The query tracks NFTStaked and NFTUnstaked events from the Staking contract.',
  op_bnb: {
    tvl
  }
}
