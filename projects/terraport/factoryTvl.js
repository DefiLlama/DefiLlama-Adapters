const { queryContractWithRetries } = require('../helper/chain/cosmos')
const { transformDexBalances } = require('../helper/portedTokens')

const CONFIG = {
  CONCURRENCY: 10,
  MAX_ERROR_RATE: 0.15,
  MAX_RETRIES: 3,
  RETRY_DELAY: 100
}

async function runWithConcurrency(items, concurrency, fn) {
  const results = []
  const errors = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(item => fn(item).catch(e => { errors.push(e); return null }))
    )
    results.push(...batchResults.filter(r => r !== null))
  }
  return { results, errors }
}

async function getAllPairs(factory, chain) {
  let allPairs = []
  let currentPairs
  let previousQueryStr = null
  const limit = 30

  do {
    let queryStr
    if (allPairs.length === 0) {
      queryStr = JSON.stringify({ pairs: { limit } })
    } else {
      const lastPair = allPairs[allPairs.length - 1]
      const startAfter = lastPair.asset_infos
      queryStr = JSON.stringify({ pairs: { start_after: startAfter, limit } })
    }

    if (queryStr === previousQueryStr) break
    previousQueryStr = queryStr

    const res = await queryContractWithRetries({ contract: factory, chain, data: queryStr })
    if (!Array.isArray(res?.pairs))
      throw new Error(`Invalid pair list returned by factory ${factory}`)
    currentPairs = res.pairs
    allPairs.push(...currentPairs)

  } while (currentPairs && currentPairs.length > 0)

  return allPairs
}

function safeBalanceToString(balance) {
  if (balance === null || balance === undefined) return '0'
  if (typeof balance === 'string' || typeof balance === 'number') return balance.toString()
  if (typeof balance === 'bigint') return balance.toString()
  if (typeof balance === 'object') {
    if (balance.value !== undefined) return balance.value.toString()
    if (balance.amount !== undefined) return balance.amount.toString()
    if (balance.balance !== undefined) return balance.balance.toString()
    return '0'
  }
  return '0'
}

function extractTokenAddress(assetInfo) {
  if (!assetInfo) return null
  if (assetInfo.token) return assetInfo.token.contract_addr
  if (assetInfo.native_token) return assetInfo.native_token.denom
  if (assetInfo.cw20) return assetInfo.cw20
  if (assetInfo.native) return assetInfo.native
  return null
}

async function getPairPoolSafe(pair, chain, retryCount = 0) {
  const contractAddr = pair.contract_addr || pair.contract

  try {
    const pairRes = await queryContractWithRetries({
      contract: contractAddr,
      chain,
      data: { pool: {} }
    })

    let addr1, addr2, bal1, bal2

    if (pairRes.assets && Array.isArray(pairRes.assets)) {
      addr1 = extractTokenAddress(pairRes.assets[0]?.info)
      addr2 = extractTokenAddress(pairRes.assets[1]?.info)
      bal1 = pairRes.assets[0]?.amount ?? '0'
      bal2 = pairRes.assets[1]?.amount ?? '0'
    } else {
      addr1 = extractTokenAddress(pairRes.asset1)
      addr2 = extractTokenAddress(pairRes.asset2)
      bal1 = pairRes.reserve1 ?? '0'
      bal2 = pairRes.reserve2 ?? '0'
    }

    if (!addr1 || !addr2) return { type: 'error', pair: contractAddr, error: 'missing asset info', errorType: 'missing_assets' }

    const n1 = Number(safeBalanceToString(bal1))
    const n2 = Number(safeBalanceToString(bal2))
    if (n1 <= 0 && n2 <= 0) return { type: 'low_liquidity', pair: contractAddr }

    return {
      type: 'success',
      data: [
        { addr: addr1, balance: bal1 },
        { addr: addr2, balance: bal2 }
      ]
    }

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY))
      return getPairPoolSafe(pair, chain, retryCount + 1)
    }

    const errorType = 'unknown'

    return { type: 'error', pair: contractAddr, error: error.message, errorType }
  }
}

function getFactoryTvl(factory) {
  return async (api) => {
    const allPairs = await getAllPairs(factory, "terra")
    if (allPairs.length === 0) return {}

    const { results, errors } = await runWithConcurrency(
      allPairs,
      CONFIG.CONCURRENCY,
      (pair) => getPairPoolSafe(pair, "terra")
    )

    const successful = results.filter(r => r.type === 'success')
    const failed = results.filter(r => r.type === 'error')

    const errorRate = (failed.length + errors.length) / allPairs.length
    if (errorRate > CONFIG.MAX_ERROR_RATE) {
      const errorsByType = {}
      failed.forEach(f => { errorsByType[f.errorType] = (errorsByType[f.errorType] || 0) + 1 })
      const summary = Object.entries(errorsByType).map(([t, c]) => `${t}: ${c}`).join(', ')
      throw new Error(
        `High error rate: ${(errorRate * 100).toFixed(1)}% (${failed.length + errors.length}/${allPairs.length}) on terra. ${summary}`
      )
    }

    const data = successful
      .map(r => r.data)
      .filter(assets => {
        if (!assets || assets.length < 2) return false
        const b0 = Number(safeBalanceToString(assets[0]?.balance || 0))
        const b1 = Number(safeBalanceToString(assets[1]?.balance || 0))
        return assets[0]?.addr && assets[1]?.addr && assets[0].addr !== assets[1].addr && (b0 > 0 || b1 > 0)
      })
      .map(assets => ({
        token0: assets[0].addr,
        token0Bal: safeBalanceToString(assets[0].balance),
        token1: assets[1].addr,
        token1Bal: safeBalanceToString(assets[1].balance),
      }))

    if (data.length === 0) return {}

    const nativeTokens = new Set()
    const ibcTokens = new Set()

    data.forEach(({ token0, token1 }) => {
      ;[token0, token1].forEach(token => {
        if (token.startsWith('ibc/')) ibcTokens.add(token)
        else if (token.length < 20) nativeTokens.add(token)
      })
    })

    const coreTokens = new Set([...nativeTokens, ...ibcTokens])
    if (coreTokens.size === 0) data.forEach(({ token0, token1 }) => { coreTokens.add(token0); coreTokens.add(token1) })

    const safeData = data.map(item => ({
      ...item,
      token0Bal: String(item.token0Bal || '0'),
      token1Bal: String(item.token1Bal || '0')
    }))

    try {
      return transformDexBalances({ data: safeData, withMetadata: false, chain: "terra", coreTokens, restrictTokenRatio: 0 })
    } catch (error) {
      const balances = {}
      safeData.forEach(({ token0, token0Bal, token1, token1Bal }) => {
        const c0 = coreTokens.has(token0)
        const c1 = coreTokens.has(token1)
        const b0 = parseFloat(token0Bal || '0')
        const b1 = parseFloat(token1Bal || '0')

        if (c0 && !c1 && b0 > 0) balances[token0] = (balances[token0] || 0) + b0 * 2
        else if (c1 && !c0 && b1 > 0) balances[token1] = (balances[token1] || 0) + b1 * 2
        else {
          if (b0 > 0) balances[token0] = (balances[token0] || 0) + b0
          if (b1 > 0) balances[token1] = (balances[token1] || 0) + b1
        }
      })

      const final = {}
      Object.entries(balances).forEach(([token, bal]) => {
        if (bal > 0) final[`terra:${token}`] = bal.toString()
      })
      return final
    }
  }
}

module.exports = { getFactoryTvl, CONFIG }
