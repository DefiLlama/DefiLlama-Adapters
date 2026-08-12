const { getConfig } = require('../helper/cache')

const BONZO_VAULTS_API = 'https://mainnet-vaults.bonzo.finance/v1/api/vaults'
const ICHI_VAULTS_API = 'https://mainnet-single-asset.bonzo.finance/v1/api/vaults'

const abi = {
  want: 'address:want',
  balance: 'uint256:balance',
  wants: 'function wants() view returns (address token0, address token1)',
  balances: 'function balances() view returns (uint256 amount0, uint256 amount1)',
  token0: 'address:token0',
  token1: 'address:token1',
  getTotalAmounts: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1)',
}

// Hedera RPC rejects large multicalls; batch in chunks of 10 (same workaround
// as projects/ichifarm/index.js). permitFailure so one bad vault is skipped.
async function batchedMultiCall(api, callAbi, calls) {
  const res = []
  for (let i = 0; i < calls.length; i += 10) {
    const part = await api.multiCall({ abi: callAbi, calls: calls.slice(i, i + 10), permitFailure: true })
    res.push(...part)
  }
  return res
}

async function tvl(api) {
  const [bonzo, ichi] = await Promise.all([
    getConfig('bonzo-vaults/bonzo', BONZO_VAULTS_API),
    getConfig('bonzo-vaults/ichi', ICHI_VAULTS_API),
  ])

  const seen = new Set()
  const bonzoClm = []
  const bonzoSingle = []
  const ichiVaults = []

  for (const v of (bonzo.vaults || [])) {
    const addr = (v.contractAddress || '').toLowerCase()
    if (!addr || seen.has(addr)) continue
    if (v.strategyType === 'concentratedLiquidity') {
      bonzoClm.push(v.contractAddress)
      seen.add(addr)
    } else if (v.strategyType === 'single') {
      bonzoSingle.push(v.contractAddress)
      seen.add(addr)
    }
  }

  for (const v of (ichi.vaults || [])) {
    const addr = (v.contractAddress || '').toLowerCase()
    if (!addr || seen.has(addr)) continue
    if (v.vaultType === 'ICHI') {
      ichiVaults.push(v.contractAddress)
      seen.add(addr)
    }
  }

  if (ichiVaults.length) {
    const t0 = await batchedMultiCall(api, abi.token0, ichiVaults)
    const t1 = await batchedMultiCall(api, abi.token1, ichiVaults)
    const amts = await batchedMultiCall(api, abi.getTotalAmounts, ichiVaults)
    amts.forEach((a, i) => {
      if (!a || !t0[i] || !t1[i]) return
      api.add(t0[i], a.total0)
      api.add(t1[i], a.total1)
    })
  }

  if (bonzoClm.length) {
    const wants = await batchedMultiCall(api, abi.wants, bonzoClm)
    const bals = await batchedMultiCall(api, abi.balances, bonzoClm)
    wants.forEach((w, i) => {
      const b = bals[i]
      if (!w || !b) return
      api.add(w.token0, b.amount0)
      api.add(w.token1, b.amount1)
    })
  }

  if (bonzoSingle.length) {
    const wants = await batchedMultiCall(api, abi.want, bonzoSingle)
    const bals = await batchedMultiCall(api, abi.balance, bonzoSingle)
    wants.forEach((token, i) => {
      if (token && bals[i]) api.add(token, bals[i])
    })
  }

  return api.getBalances()
}

module.exports = {
  methodology: 'Counts assets deposited in Bonzo Yield Vaults and Bonzo-operated ICHI vaults on Hedera. The vault list is enumerated from Bonzo\'s public APIs; TVL is computed on-chain from each vault\'s token balances (balances()/getTotalAmounts() for concentrated-liquidity and ICHI vaults, want()+balance() for single-asset vaults). Marked double-counted because the underlying liquidity is deployed into SaucerSwap pools already counted on DefiLlama.',
  doublecounted: true,
  start: 1756237030, 
  hedera: { tvl },
}
