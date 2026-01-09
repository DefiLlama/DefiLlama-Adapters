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

async function tvl(api) {
  const queryId = process.env.DUNE_QUERY_TVL || '6292090'
  const apiKey = process.env.DUNE_API_KEY

  if (!apiKey) {
    throw new Error('DUNE_API_KEY is missing')
  }
  
  const result = await retry(async bail => {
    try {
      const response = await axios.get(
        `https://api.dune.com/api/v1/query/${queryId}/results`,
        {
          headers: { 'X-Dune-Api-Key': apiKey }
        }
      )
      if (response.data.state === 'QUERY_STATE_FAILED') bail(new Error('Dune query failed'))
      return response.data
    } catch (e) {
      console.log('Dune API Error:', e.response?.data || e.message)
      throw e
    }
  }, { retries: 3, minTimeout: 2000 })

  const rows = result.result?.rows
  if (!rows || rows.length === 0) return

  const totalUsd = parseFloat(rows[0].total_tvl_usd)
  
  // Use USDT on Ethereum (6 decimals) to represent USD value
  sdk.util.sumSingleBalance(
      api.getBalances(), 
      'ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      totalUsd * 1e6
  )
}

module.exports = {
  methodology: 'TVL is fetched from Dune Analytics (Query ID: 6292090), representing the total USD value of staked NFTs.',
  op_bnb: {
    tvl
  }
}
