
const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')
const { PromisePool } = require('@supercharge/promise-pool')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl() {
  let tvl = 0
  let pairs = await get('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/pairs')
  if (typeof pairs === 'string') pairs = JSON.parse(pairs.replace('},]', '}]'))

  const { errors } = await PromisePool.withConcurrency(15)
    .for(pairs)
    .process(async ({ pool_id }) => {
      const res = await get(`https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/pool_tvl?poolId=${pool_id}&limit=1`)
      if (res.length > 0 && res[0].tvlUSD < 100e6)
        tvl += +res[0].tvlUSD
    })

  if (errors && errors.length)
    throw errors[0]

  return toUSDTBalances(tvl)
}
