const { queryContract, queryContracts, sumTokens, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

const CONFIG = {
  CONCURRENCY: 10,
  MAX_ERROR_RATE: 0.15, // error rate threshold
  MIN_LIQUIDITY_USD: 15, // Minimum $15 liquidity
  MIN_RESERVE_THRESHOLD: 1000000, // Minimum reserve amount
  MAX_RETRIES: 3,
  RETRY_DELAY: 100 // 1 second
}

async function getAllPairs(factory, chain) {
  let allPairs = []
  let currentPairs;
  let previousQueryStr = null;
  const limit = 20; 

  do {
    let queryStr;
    if (allPairs.length === 0) {
      queryStr = `{"pairs": {"limit": ${limit}}}`;
    } else {
      const lastPair = allPairs[allPairs.length - 1];
      const startAfter = [lastPair.asset1, lastPair.asset2];
      queryStr = `{"pairs": {"pagination": {"limit": ${limit}, "start_after": ${JSON.stringify(startAfter)}}}}`;
    }

    if (queryStr === previousQueryStr) {
      break;
    }

    previousQueryStr = queryStr;
    try {
      currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs
      allPairs.push(...currentPairs)
    } catch (error) {
      break;
    }

  } while (currentPairs && currentPairs.length > 0)
  
  return allPairs
}

function hasMinimumLiquidity(reserve1, reserve2) {
  const r1 = Number(safeBalanceToString(reserve1))
  const r2 = Number(safeBalanceToString(reserve2))
  
  return r1 >= 0 && r2 >= 0
}

async function getPairPoolSafe(pair, chain, retryCount = 0) {
  try {
    const pairRes = await queryContractWithRetries({ 
      contract: pair.contract, 
      chain, 
      data: { pool: {} } 
    })

    if (!hasMinimumLiquidity(pairRes.reserve1, pairRes.reserve2)) {
      return { 
        type: 'low_liquidity', 
        pair: pair.contract,
        reserves: [pairRes.reserve1, pairRes.reserve2]
      }
    }

    const assetsPair = []
    let addr1 = pairRes.asset1.cw20 || pairRes.asset1.native
    assetsPair.push({ addr: addr1, balance: pairRes.reserve1 })

    let addr2 = pairRes.asset2.cw20 || pairRes.asset2.native
    assetsPair.push({ addr: addr2, balance: pairRes.reserve2 })

    return { type: 'success', data: assetsPair }

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY))
      return getPairPoolSafe(pair, chain, retryCount + 1)
    }

    const errorType = error.message.includes('timeout') ? 'timeout' : 
                     error.message.includes('rate limit') ? 'rate_limit' :
                     error.message.includes('not found') ? 'not_found' : 'unknown'

    return { 
      type: 'error', 
      pair: pair.contract, 
      error: error.message,
      errorType 
    }
  }
}

function safeBalanceToString(balance) {
  if (balance === null || balance === undefined) {
    return '0';
  }
  
  if (typeof balance === 'string' || typeof balance === 'number') {
    return balance.toString();
  }
  
  if (typeof balance === 'bigint') {
    return balance.toString();
  }
  
  if (typeof balance === 'object' && balance.toString && typeof balance.toString === 'function') {
    return balance.toString();
  }
  
  if (typeof balance === 'object') {
    if (balance.value !== undefined) return balance.value.toString();
    if (balance.amount !== undefined) return balance.amount.toString();
    if (balance.balance !== undefined) return balance.balance.toString();
    try {
      return JSON.stringify(balance);
    } catch (e) {
      return '0';
    }
  }
  
  return '0';
}

function getFactoryTvl(factory) {
  return async () => {
    const allPairs = await getAllPairs(factory, "terra")
    
    if (allPairs.length === 0) {
      return {}
    }


    const { results, errors } = await PromisePool
      .withConcurrency(CONFIG.CONCURRENCY)
      .for(allPairs)
      .process(async (pair) => {
        return await getPairPoolSafe(pair, "terra")
      })

    const successful = results.filter(r => r.type === 'success')
    const lowLiquidity = results.filter(r => r.type === 'low_liquidity')
    const failed = results.filter(r => r.type === 'error')


    const totalProcessed = allPairs.length
    const totalErrors = failed.length + errors.length
    const errorRate = totalErrors / totalProcessed

    if (errorRate > CONFIG.MAX_ERROR_RATE) {
      const errorsByType = {}
      failed.forEach(f => {
        errorsByType[f.errorType] = (errorsByType[f.errorType] || 0) + 1
      })

      const errorSummary = Object.entries(errorsByType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ')

      throw new Error(
        `High error rate detected: ${(errorRate * 100).toFixed(1)}% ` +
        `(${totalErrors}/${totalProcessed} pairs failed) on terra. ` +
        `Error breakdown: ${errorSummary}`
      )
    }

    const validPairs = successful.map(r => r.data)
    
    const data = validPairs
      .filter(assets => {
        if (!assets || assets.length < 2) return false
        const token0 = assets[0]?.addr
        const token1 = assets[1]?.addr
        const balance0 = Number(safeBalanceToString(assets[0]?.balance || 0))
        const balance1 = Number(safeBalanceToString(assets[1]?.balance || 0))

        return token0 && token1 && token0 !== token1 && (balance0 > 0 || balance1 > 0)
      })
      .map((assets) => ({
        token0: assets[0].addr,
        token0Bal: safeBalanceToString(assets[0].balance),
        token1: assets[1].addr,
        token1Bal: safeBalanceToString(assets[1].balance),
      }))

    if (data.length === 0) {
      return {}
    }

    const nativeTokens = new Set()
    const cw20Tokens = new Set()
    const ibcTokens = new Set()

    data.forEach(({ token0, token1 }) => {
      [token0, token1].forEach(token => {
        if (token.startsWith('terra1') && token.length > 50) {
          cw20Tokens.add(token)
        } else if (token.startsWith('ibc/')) {
          ibcTokens.add(token)
        } else if (token.startsWith('u') && token.length < 10) {
          nativeTokens.add(token)
        }
      })
    })

    const coreTokens = new Set([
      ...nativeTokens,
      ...ibcTokens,
    ])

    if (coreTokens.size === 0) {
      data.forEach(({ token0, token1 }) => {
        coreTokens.add(token0)
        coreTokens.add(token1)
      })
    }

    const safeData = data.map(item => ({
      ...item,
      token0Bal: String(item.token0Bal || '0'),
      token1Bal: String(item.token1Bal || '0')
    }))
    try {
      const result = transformDexBalances({
        data: safeData,
        withMetadata: false, 
        chain: "terra",
        coreTokens,
        restrictTokenRatio: 0
      })
      
      return result
      
    } catch (error) {
      const balances = {}
      
      safeData.forEach(({ token0, token0Bal, token1, token1Bal }) => {
        const isCoreToken0 = coreTokens.has(token0.replace('ibc/', ''))
        const isCoreToken1 = coreTokens.has(token1.replace('ibc/', ''))
        
        const bal0 = parseFloat(token0Bal || '0')
        const bal1 = parseFloat(token1Bal || '0')
        
        if ((isCoreToken0 && isCoreToken1) || (!isCoreToken0 && !isCoreToken1)) {
          if (bal0 > 0) {
            balances[token0] = (balances[token0] || 0) + bal0
          }
          if (bal1 > 0) {
            balances[token1] = (balances[token1] || 0) + bal1
          }
        } else if (isCoreToken0) {
          if (bal0 > 0) {
            balances[token0] = (balances[token0] || 0) + (bal0 * 2)
          }
        } else {
          if (bal1 > 0) {
            balances[token1] = (balances[token1] || 0) + (bal1 * 2)
          }
        }
      })
      
      const finalBalances = {}
      Object.entries(balances).forEach(([token, balance]) => {
        if (balance > 0) {
          finalBalances[`terra:${token}`] = balance.toString()
        }
      })
      
      return finalBalances
    }
  }
}

module.exports = {
  getFactoryTvl,
  CONFIG 
}