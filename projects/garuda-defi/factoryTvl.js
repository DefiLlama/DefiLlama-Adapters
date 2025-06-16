const { queryContract, queryContracts, sumTokens, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

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
    currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs
    allPairs.push(...currentPairs)

  } while (allPairs.length > 0)
  const dtos = []

  const getPairPool = (async (pair) => {
    const pairRes = await queryContractWithRetries({ contract: pair.contract, chain, data: { pool: {} } })
    const assetsPair = []
    let addr1 = pairRes.asset1.cw20 || pairRes.asset1.native
    assetsPair.push({ addr: addr1, balance: pairRes.reserve1 })

    let addr2 = pairRes.asset2.cw20 || pairRes.asset2.native
    assetsPair.push({ addr: addr2, balance: pairRes.reserve2 })

    dtos.push(assetsPair)
  })
  const { errors } = await PromisePool
    .withConcurrency(10)
    .for(allPairs)
    .process(getPairPool)
  console.log(errors)

  if ((errors?.length ?? 0) > 50) {
    throw new Error(`Too many errors: ${errors.length}/${allPairs.length} on ${chain}`)
  }
  return dtos
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
    const pairs = await getAllPairs(factory, "terra")

    const data = pairs
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
        token0Bal: safeBalanceToString(assets[0].balance), // Convert to string
        token1: assets[1].addr,
        token1Bal: safeBalanceToString(assets[1].balance), // Convert to string
      }))

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
      return transformDexBalances({
        data: safeData,
        withMetadata: false, 
        chain: "terra",
        coreTokens,
        restrictTokenRatio: 0
      })
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
  getFactoryTvl
}