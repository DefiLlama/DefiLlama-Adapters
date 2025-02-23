const sdk = require('@defillama/sdk');
const { assertArgumentCount } = require('ethers');
const SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cm7h41i2g8nr5011r3r5fd39v/subgraphs/sonic-reserve/1.0.0/gn'
const rBTC_CONTRACT = '0x473286faD076c050FB48a449c77d7434d947cE00';

async function coreTvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: rBTC_CONTRACT })
  return api.sumTokens({ owner: rBTC_CONTRACT, tokens })
}

async function sonicTvl() {
  const query = `{
    lstbalances {
      token,
      amount
    }
  }`

  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })

  const { data: { lstbalances } } = await response.json()
  
  // For debugging
  const balances = {}
  
  // Process each balance and add to TVL
  for (const { token, amount } of lstbalances) {
    try {
      // Convert amount to string to ensure proper number handling
      // Add token balance to TVL calculation with sonic chain specified
      sdk.util.sumSingleBalance(balances, token, amount,'sonic')
    } catch (e) {
      console.error(`Failed to add token ${token} on sonic chain:`, e)
    }
  }
  return balances
}

module.exports = {
  methodology: 'TVL is calculated by summing all token balances. For core chain, it uses the rBTC contract balances. For Sonic chain, it uses the Sonic subgraph data with token prices from DefiLlama.',
  start: '2024-05-17',
  core: {
    tvl: coreTvl
  },
  sonic: {
    tvl: sonicTvl
  }
}
