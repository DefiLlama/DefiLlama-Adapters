const alephium = require('../helper/chain/alephium')

// Pool addresses - TODO: Could be made dynamic by querying factory contract
const poolAddresses = [
  '25ywM8iGxKpZWuGA5z6DXKGcZCXtPBmnbQyJEsjvjjWTy', // alphAyinPool
  '2A5R8KZQ3rhKYrW7bAS4JTjY9FCFLJg6HjQpqSFZBqACX', // alphUsdtPool
  '283R192Z8n6PhXSpSciyvCsLEiiEVFkSE6MbRBA4KSaAj', // alphUsdcPool
  'yXMFxdoKcE86W9NAyajc8Z3T3k2f5FGiHqHtuA69DYT1',  // alphWethPool
  '28XY326TxvSekaAwiWDLFg2QBRfacSga8dyNJCYGUYNbq', // alphWbtcPool
  'vFpZ1DF93x1xGHoXM8rsDBFjpcoSsCi5ZEuA5NG5UJGX',  // alphApadPool
  '25b5aNfdrNRjJ7ugPTkxThT51L1NSvf8igQyDHKZhweiK', // alphChengPool
  'uM4QJwHqFoTF2Pou8TqwhaDiHYLk4SHG65uaQG8r7KkT',  // alphAnsdPool
  '23cXw23ZjRqKc7i185ZoH8vh9KT4XTumVRWpVLUecgLMd', // alphAlphagaPool
  '21NEBCk8nj5JBKpS7eN8kX6xGJoLHNqTS3WBFnZ7q8L9m', // ayinUsdtPool
  '2961aauvprhETv6TXGQRc3zZY4FbLnqKon2a4wK6ABH9q', // ayinUsdcPool
  '247rZysrruj8pj2GnFyK2bqB2nU4JsUj7k2idksAp4XMy', // ayinApadPool
  '27C75V9K5o9CkkGTMDQZ3x2eP82xnacraEqTYXA35Xuw5', // usdtUsdcPool
]

// Tokens that have market prices available
const knownTokens = new Set([
  '556d9582463fe44fbd108aedc9f409f69086dc78d994b88ea6c9e65f8bf98e00', // USDTeth
  '722954d9067c5a5ad532746a024f2a9d7a18ed9b90e27d0a3a504962160b5600', // USDCeth
  '19246e8c2899bc258a1156e08466e3cdd3323da756d8a543c7fc911847b96f00', // WETH
  '383bc735a4de6722af80546ec9eeb3cff508f2f68e97da19489ce69f3e703200', // WBTC
])

const alephId = '0000000000000000000000000000000000000000000000000000000000000000'
const xAyinAddress = 'zst5zMzizEeFYFis6DNSknY5GCYTpM85D3yXeRLe2ug3'

function isValidToken(balance) {
  return balance < 1e70 && balance > 1e6 // Filter out LP tokens and dust
}

async function getStakingValue() {
  const results = await alephium.contractMultiCall([
    { group: 0, address: xAyinAddress, methodIndex: 3 }, // totalSupply
    { group: 0, address: xAyinAddress, methodIndex: 11 } // currentPrice
  ])
  
  const totalSupply = Number(results[0].returns[0].value) / 1e18
  const currentPrice = Number(results[1].returns[0].value) / 1e18
  return totalSupply * currentPrice
}

async function tvl(api) {
  // Get balances from all pools
  const [alphBalances, tokenBalances] = await Promise.all([
    Promise.all(poolAddresses.map(addr => alephium.getAlphBalance(addr))),
    Promise.all(poolAddresses.map(addr => alephium.getTokensBalance(addr)))
  ])
  
  // Add all ALPH reserves
  const totalAlph = alphBalances.reduce((sum, { balance }) => sum + Number(balance), 0)
  api.add(alephId, totalAlph)
  
  // Calculate prices for unknown tokens using ALPH pairs
  const tokenPrices = new Map()
  
  poolAddresses.forEach((poolAddr, i) => {
    const alphBalance = Number(alphBalances[i].balance)
    const tokens = tokenBalances[i]
    
    // Only use pools with significant ALPH for price calculation
    if (alphBalance > 1e18) {
      tokens.forEach(({ tokenId, balance }) => {
        const tokenBalance = Number(balance)
        if (isValidToken(tokenBalance) && !knownTokens.has(tokenId)) {
          // Store ALPH equivalent value for this token type
          if (!tokenPrices.has(tokenId)) {
            tokenPrices.set(tokenId, { alphPerToken: alphBalance / tokenBalance })
          }
        }
      })
    }
  })
  
  // Add all valid tokens
  tokenBalances.flat().forEach(({ tokenId, balance }) => {
    const tokenBalance = Number(balance)
    if (isValidToken(tokenBalance)) {
      if (knownTokens.has(tokenId)) {
        api.add(tokenId, tokenBalance) // Let DefiLlama price these
      } else if (tokenPrices.has(tokenId)) {
        const { alphPerToken } = tokenPrices.get(tokenId)
        api.add(alephId, tokenBalance * alphPerToken) // Convert to ALPH equivalent
      }
    }
  })
}

async function staking() {
  return { ayin: await getStakingValue() }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL locked in the Ayin pools on Alephium',
  alephium: { tvl, staking, }
}
