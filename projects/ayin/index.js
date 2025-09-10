const alephium = require('../helper/chain/alephium')
const axios = require('axios')
const { alephium: coreAssets } = require('../helper/coreAssets.json')

const CL_FACTORY_ADDRESS = 'z73CeQLRpbaQ5gF7bJ1yoYqmmonwC9h9wEwLxGF9EjVy'

const EXPLORER_API_HOST = "https://backend.mainnet.alephium.org"
const NODE_API_HOST = "https://node.mainnet.alephium.org"

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
  coreAssets.USDT, // USDTeth
  coreAssets.USDC, // USDCeth
  coreAssets.WETH, // WETH
  coreAssets.WBTC, // WBTC
])

const alephId = '0000000000000000000000000000000000000000000000000000000000000000'
const xAyinAddress = 'zst5zMzizEeFYFis6DNSknY5GCYTpM85D3yXeRLe2ug3'

const isValidToken = (balance) => balance < 1e70 && balance > 1e6

async function fetchSubContracts(address, start = 0, limit = 100) {
  const response = await axios.get(`${NODE_API_HOST}/contracts/${address}/sub-contracts`, {
    params: { start: start.toString(), limit: limit.toString() }
  })
  return response.data
}

async function fetchAllCLPools() {
  const allPools = []
  const limit = 100
  const maxPools = 1000
  let start = 0
  
  while (allPools.length < maxPools) {
    try {
      const response = await fetchSubContracts(CL_FACTORY_ADDRESS, start, limit)
      
      if (!response?.subContracts?.length) break
      
      allPools.push(...response.subContracts)
      if (response.subContracts.length < limit) break
      
      start += limit
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      // 404 means we've reached the end of available sub-contracts
      if (error.response?.status === 404) {
        break
      }
      // Re-throw other errors for monitoring
      throw error
    }
  }
  
  return allPools.slice(0, maxPools)
}

async function calculateCLPoolTVL(poolAddress, api, tokenPrices = new Map()) {
  const [alphBalance, tokenBalances] = await Promise.all([
    alephium.getAlphBalance(poolAddress).catch(() => ({ balance: '0' })),
    alephium.getTokensBalance(poolAddress).catch(() => [])
  ])
  
  let hasValidBalance = false
  const alphAmount = Number(alphBalance.balance)
  
  // Add ALPH balance
  if (alphAmount > 1e15) {
    api.add(alephId, alphAmount)
    hasValidBalance = true
  }
  
  // Process tokens
  tokenBalances.forEach(({ tokenId, balance }) => {
    const tokenAmount = Number(balance)
    if (isValidToken(tokenAmount)) {
      if (knownTokens.has(tokenId)) {
        // Add known tokens directly
        api.add(tokenId, tokenAmount)
        hasValidBalance = true
      } else if (tokenPrices.has(tokenId)) {
        // Use AMM-derived prices for unknown tokens
        const { alphPerToken } = tokenPrices.get(tokenId)
        api.add(alephId, tokenAmount * alphPerToken)
        hasValidBalance = true
      }
    }
  })
  
  return hasValidBalance ? 1 : 0
}

async function addCLPoolsTVL(api, tokenPrices = new Map()) {
  const clPools = await fetchAllCLPools()
  if (!clPools?.length) return 0
  
  let successCount = 0
  const batchSize = 5
  const maxTime = 30000
  const startTime = Date.now()
  
  for (let i = 0; i < clPools.length; i += batchSize) {
    if (Date.now() - startTime > maxTime) break
    
    const batch = clPools.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map(addr => calculateCLPoolTVL(addr, api, tokenPrices))
    )
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount += result.value
      } else {
        // Log individual pool failures but don't fail the entire process
        console.warn(`CL Pool ${batch[index]} failed:`, result.reason?.message)
      }
    })
    
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
  
  return tokenPrices // Return token prices for use in CL pools
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
  const tokenPrices = await processAMMPools(api)
  await addCLPoolsTVL(api, tokenPrices)
}

async function staking() {
  return { ayin: await getStakingValue() }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL locked in AYIN AMM pools (V2) and CL (Concentrated Liquidity) pools on Alephium. Unknown tokens are valued using ALPH pair reserves.',
  alephium: { 
    tvl,
    staking
  }
}
