const axios = require('axios')
const sdk = require('@defillama/sdk')

// Simple retry function
async function retry(fn, { retries = 3, minTimeout = 2000 } = {}) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn((err) => { throw err }) // bail function
    } catch (e) {
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, minTimeout))
    }
  }
}

// CPNFT contract address
const CPNFT_CONTRACT = '0x2d3A1b0fD28D8358643b4822B475bF435F2611cb'

// SQL query for TVL calculation - returns staked counts by level
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
        level,
        SUM(CASE WHEN action = 'STAKE' THEN 1 ELSE -1 END) as net_staked
    FROM staking_events
    GROUP BY token_id, level
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
  const executeResponse = await axios.post(
    'https://api.dune.com/api/v1/sql/execute',
    {
      sql: sql.trim(),
      performance: 'medium'
    },
    {
      headers: { 'X-Dune-Api-Key': apiKey }
    }
  )

  const executionId = executeResponse.data.execution_id
  if (!executionId) {
    throw new Error('Failed to get execution_id from Dune API')
  }

  // Step 2: Poll for execution status
  const maxAttempts = 30
  const pollInterval = 3000 // 3 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait before checking status (except first attempt)
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, pollInterval))
    }

    const statusResponse = await axios.get(
      `https://api.dune.com/api/v1/execution/${executionId}/status`,
      {
        headers: { 'X-Dune-Api-Key': apiKey }
      }
    )

    const state = statusResponse.data.state

    if (state === 'QUERY_STATE_COMPLETED') {
      // Step 3: Get results
      const resultsResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/results`,
        {
          headers: { 'X-Dune-Api-Key': apiKey }
        }
      )
      return resultsResponse.data
    } else if (state === 'QUERY_STATE_FAILED') {
      throw new Error(`Dune query execution failed: ${statusResponse.data.error || 'Unknown error'}`)
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
      console.log('Dune API Error:', e.response?.data || e.message)
      if (e.message.includes('timeout') || e.message.includes('failed')) {
        bail(e)
      }
      throw e
    }
  }, { retries: 3, minTimeout: 2000 })

  const rows = result.result?.rows
  if (!rows || rows.length === 0) {
    console.log('No data returned from Dune query')
    return
  }

  // Step 2: Get prices for each level from the contract
  // NFTLevel enum values: 1-6 (C, B, A, S, SS, SSS)
  const levels = rows.map(row => parseInt(row.level))
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
    const level = parseInt(row.level)
    const stakedCount = parseInt(row.staked_count)
    const price = priceMap[level]
    
    if (!price || price <= 0) {
      console.warn(`Invalid price for level ${level}: ${price}`)
      continue
    }
    
    totalUsd += stakedCount * price
  }
  
  if (totalUsd <= 0) {
    console.log('No valid TVL calculated')
    return
  }
  
  // Use USDT on Ethereum (6 decimals) to represent USD value
  sdk.util.sumSingleBalance(
      api.getBalances(), 
      'ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      Math.floor(totalUsd * 1e6)
  )
}

module.exports = {
  methodology: 'TVL is calculated by fetching staked NFT counts by level from Dune Analytics and multiplying by prices fetched from the CPNFT contract\'s getLevelPrice() method. The query tracks NFTStaked and NFTUnstaked events from the Staking contract.',
  op_bnb: {
    tvl
  }
}
