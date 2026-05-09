const { getCache } = require('../helper/http')

const METRICS_URL = 'https://api.baseline.markets/v1/protocol/metrics'

async function getReserveMetrics(api) {
  const data = await getCache(METRICS_URL)
  if (!Array.isArray(data.reserveMetrics))
    throw new Error('Baseline metrics response is missing reserveMetrics')

  return data.reserveMetrics.filter(row => row.chainId === String(api.chainId))
}

async function getStakingMetrics(api) {
  const data = await getCache(METRICS_URL)
  if (!Array.isArray(data.stakingMetrics))
    throw new Error('Baseline metrics response is missing stakingMetrics')

  return data.stakingMetrics.filter(row => row.chainId === String(api.chainId))
}

async function addMetric(api, metric) {
  const reserveMetrics = await getReserveMetrics(api)

  reserveMetrics.forEach(row => {
    if (!row.tokenAddress || !row[metric]) return
    api.add(row.tokenAddress, row[metric])
  })
}

async function tvl(api) {
  return addMetric(api, 'reserveLiquidity')
}

async function borrowed(api) {
  return addMetric(api, 'totalDebt')
}

async function staking(api) {
  const stakingMetrics = await getStakingMetrics(api)

  stakingMetrics.forEach(row => {
    if (!row.tokenAddress || !row.totalStaked) return
    api.add(row.tokenAddress, row.totalStaked)
  })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts reserve assets held as liquidity in Baseline pools. Borrowed counts reserve assets lent from those pools to borrowers and is reported separately. Staking counts staked B tokens. Staked bTokens are not included in TVL.',
  ethereum: {
    tvl,
    borrowed,
    staking,
  },
  base: {
    tvl,
    borrowed,
  },
}
