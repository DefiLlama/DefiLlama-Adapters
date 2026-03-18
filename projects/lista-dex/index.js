const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const NATIVE_PLACEHOLDER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const config = {
  bsc: {
    marketListUrl:
      'https://api.lista.org/api/moolah/borrow/marketList?page=1&pageSize=1000&chain=bsc',
  },
  ethereum: {
    marketListUrl:
      'https://api.lista.org/api/moolah/borrow/marketList?page=1&pageSize=1000&chain=ethereum',
  },
}

async function getSmartLendingMarketIds(api) {
  const { marketListUrl } = config[api.chain]
  const { data } = await getConfig('lista/marketList-' + api.chain, marketListUrl)
  const list = data?.list ?? []
  return list
    .filter((m) => m.chain === api.chain)
    .filter((m) => m.isSmartLending === true)
    .filter((m) => m.status === 1)
    .map((m) => m.marketId)
    .filter(Boolean)
}

async function getMarketConfig(api, marketId) {
  const url = `https://api.lista.org/api/moolah/market/${marketId}?chain=${api.chain}`
  const { data } = await getConfig(`lista/marketInfo-${api.chain}-${marketId}`, url)
  const cfg = data?.smartCollateralConfig
  if (!cfg?.swapPool || !cfg?.token0 || !cfg?.token1) return null
  return {
    swapPool: cfg.swapPool.toLowerCase(),
    token0: cfg.token0.toLowerCase(),
    token1: cfg.token1.toLowerCase(),
  }
}

async function tvl(api) {
  const marketIds = await getSmartLendingMarketIds(api)
  if (marketIds.length === 0) return {}

  const configs = await Promise.all(marketIds.map((id) => getMarketConfig(api, id)))
  const valid = configs.filter(Boolean)
  if (valid.length === 0) return {}

  // Multiple marketIds can reference the same underlying swapPool.
  // TVL lives at the pool level, so dedupe by swapPool to avoid double counting.
  const byPool = new Map()
  for (const c of valid) {
    const existing = byPool.get(c.swapPool)
    if (!existing) {
      byPool.set(c.swapPool, c)
      continue
    }
    // If metadata conflicts, keep the first and ignore the rest
    if (existing.token0 !== c.token0 || existing.token1 !== c.token1) {
      continue
    }
  }

  const unique = [...byPool.values()]
  const swapPools = unique.map((c) => c.swapPool)
  const token0s = unique.map((c) => c.token0)
  const token1s = unique.map((c) => c.token1)

  const bal0s = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: swapPools.map((pool, i) => ({ target: token0s[i], params: [pool] })),
  })

  const nativeIndices = token1s
    .map((t, i) => (t === NATIVE_PLACEHOLDER ? i : -1))
    .filter((i) => i >= 0)
  const erc20Indices = token1s
    .map((t, i) => (t !== NATIVE_PLACEHOLDER ? i : -1))
    .filter((i) => i >= 0)

  const bal1s = new Array(unique.length).fill(null)
  if (nativeIndices.length > 0) {
    const nativePools = nativeIndices.map((i) => swapPools[i])
    const { output: nativeOutputs } = await sdk.api.eth.getBalances({
      targets: nativePools,
      chain: api.chain,
      block: api.block,
    })
    nativeIndices.forEach((idx, j) => {
      bal1s[idx] = nativeOutputs[j]?.balance ?? 0n
    })
  }
  if (erc20Indices.length > 0) {
    const erc20Balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: erc20Indices.map((i) => ({ target: token1s[i], params: [swapPools[i]] })),
    })
    erc20Indices.forEach((idx, j) => {
      bal1s[idx] = erc20Balances[j] ?? 0n
    })
  }

  for (let i = 0; i < unique.length; i++) {
    api.add(token0s[i], bal0s[i] ?? 0n)
    if (token1s[i] === NATIVE_PLACEHOLDER) {
      api.addGasToken(bal1s[i] ?? 0n)
    } else {
      api.add(token1s[i], bal1s[i] ?? 0n)
    }
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL = sum of token0 and token1 balances in each smart lending market swapPool (two collateral assets). Data from Moolah market list + market basic info API.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
