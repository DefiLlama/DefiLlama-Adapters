const alephium = require('../helper/chain/alephium')
const axios = require('axios')

const CL_FACTORY_ADDRESS = 'z73CeQLRpbaQ5gF7bJ1yoYqmmonwC9h9wEwLxGF9EjVy'
const NODE_API_HOST = "https://node.mainnet.alephium.org"
const BACKEND_API_HOST = "https://backend.mainnet.alephium.org"

// AMM pool addresses
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

// Known tokens with market prices
const knownTokens = new Set([
  '556d9582463fe44fbd108aedc9f409f69086dc78d994b88ea6c9e65f8bf98e00', // USDTeth
  '722954d9067c5a5ad532746a024f2a9d7a18ed9b90e27d0a3a504962160b5600', // USDCeth
  '19246e8c2899bc258a1156e08466e3cdd3323da756d8a543c7fc911847b96f00', // WETH
  '383bc735a4de6722af80546ec9eeb3cff508f2f68e97da19489ce69f3e703200', // WBTC
])

const alephId = '0000000000000000000000000000000000000000000000000000000000000000'
const xAyinAddress = 'zst5zMzizEeFYFis6DNSknY5GCYTpM85D3yXeRLe2ug3'

const isValidToken = (balance) => balance < 1e70 && balance > 1e6

async function fetchSubContracts(address, start = 0, limit = 100) {
  try {
    let response
    try {
      response = await axios.get(`${NODE_API_HOST}/contracts/${address}/sub-contracts`, {
        params: { start: start.toString(), limit: limit.toString() }
      })
    } catch {
      response = await axios.get(`${BACKEND_API_HOST}/contracts/${address}/sub-contracts`, {
        params: { start: start.toString(), limit: limit.toString() }
      })
    }
    return response.data
  } catch (error) {
    return null
  }
}

async function fetchAllCLPools() {
  const allPools = []
  const limit = 100
  const maxPools = 1000
  let start = 0
  
  while (allPools.length < maxPools) {
    const response = await fetchSubContracts(CL_FACTORY_ADDRESS, start, limit)
    
    if (!response?.subContracts?.length) break
    
    allPools.push(...response.subContracts)
    if (response.subContracts.length < limit) break
    
    start += limit
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return allPools.slice(0, maxPools)
}

async function calculateCLPoolTVL(poolAddress, api) {
  try {
    const [alphBalance, tokenBalances] = await Promise.all([
      alephium.getAlphBalance(poolAddress).catch(() => ({ balance: '0' })),
      alephium.getTokensBalance(poolAddress).catch(() => [])
    ])
    
    let hasValidBalance = false
    
    // Add ALPH balance
    const alphAmount = Number(alphBalance.balance)
    if (alphAmount > 1e15) {
      api.add(alephId, alphAmount)
      hasValidBalance = true
    }
    
    // Add known token balances only
    tokenBalances.forEach(({ tokenId, balance }) => {
      const tokenAmount = Number(balance)
      if (isValidToken(tokenAmount) && knownTokens.has(tokenId)) {
        api.add(tokenId, tokenAmount)
        hasValidBalance = true
      }
    })
    
    return hasValidBalance ? 1 : 0
  } catch {
    return 0
  }
}

async function addCLPoolsTVL(api) {
  const clPools = await fetchAllCLPools()
  if (!clPools?.length) return 0
  
  let successCount = 0
  const batchSize = 5
  const maxTime = 30000
  const startTime = Date.now()
  
  for (let i = 0; i < clPools.length; i += batchSize) {
    if (Date.now() - startTime > maxTime) break
    
    const batch = clPools.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(addr => calculateCLPoolTVL(addr, api).catch(() => 0))
    )
    
    successCount += results.reduce((sum, result) => sum + result, 0)
    
    if (i + batchSize < clPools.length) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  return successCount
}

async function processAMMPools(api) {
  const [alphBalances, tokenBalances] = await Promise.all([
    Promise.all(poolAddresses.map(addr => alephium.getAlphBalance(addr))),
    Promise.all(poolAddresses.map(addr => alephium.getTokensBalance(addr)))
  ])
  
  // Add ALPH reserves
  const totalAlph = alphBalances.reduce((sum, { balance }) => sum + Number(balance), 0)
  api.add(alephId, totalAlph)
  
  // Calculate unknown token prices using ALPH pairs
  const tokenPrices = new Map()
  poolAddresses.forEach((_, i) => {
    const alphBalance = Number(alphBalances[i].balance)
    const tokens = tokenBalances[i]
    
    if (alphBalance > 1e18) {
      tokens.forEach(({ tokenId, balance }) => {
        const tokenBalance = Number(balance)
        if (isValidToken(tokenBalance) && !knownTokens.has(tokenId) && !tokenPrices.has(tokenId)) {
          tokenPrices.set(tokenId, { alphPerToken: alphBalance / tokenBalance })
        }
      })
    }
  })
  
  // Add tokens
  tokenBalances.flat().forEach(({ tokenId, balance }) => {
    const tokenBalance = Number(balance)
    if (isValidToken(tokenBalance)) {
      if (knownTokens.has(tokenId)) {
        api.add(tokenId, tokenBalance)
      } else if (tokenPrices.has(tokenId)) {
        const { alphPerToken } = tokenPrices.get(tokenId)
        api.add(alephId, tokenBalance * alphPerToken)
      }
    }
  })
}

async function getStakingValue() {
  const results = await alephium.contractMultiCall([
    { group: 0, address: xAyinAddress, methodIndex: 3 },
    { group: 0, address: xAyinAddress, methodIndex: 11 }
  ])
  
  const totalSupply = Number(results[0].returns[0].value) / 1e18
  const currentPrice = Number(results[1].returns[0].value) / 1e18
  return totalSupply * currentPrice
}

async function tvl(api) {
  await processAMMPools(api)
  await addCLPoolsTVL(api)
}

async function tvlV2(api) {
  await processAMMPools(api)
}

async function staking() {
  return { ayin: await getStakingValue() }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL locked in AYIN AMM pools (V2) and CL (Concentrated Liquidity) pools on Alephium. Unknown tokens are valued using ALPH pair reserves.',
  alephium: { 
    tvl,
    staking,
    pool2: tvlV2
  }
}
