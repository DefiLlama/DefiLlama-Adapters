const { get } = require("../helper/http")
const sdk = require('@defillama/sdk')

async function getPools() {
  const pools = []
  let skip = 0
  let data
  const size = 100
  const url = () => `https://api.carbon.network/carbon/liquiditypool/v1/pools?pagination.limit=${size}&pagination.offset=${skip}`
  do {
    data = await get(url())
    skip += size
    pools.push(...data.pools)
  } while (data.pools.length)
  return pools
}

async function getTokenInfo() {
  const { result: { gecko } } = await get('https://api-insights.carbon.network/info/denom_gecko_map')
  const tokenMap = {}
  let skip = 0
  let data
  const size = 100
  const url = () => `https://api.carbon.network/carbon/coin/v1/tokens?pagination.limit=${size}&pagination.offset=${skip}`
  do {
    data = await get(url())
    skip += size
    for (const token of data.tokens) {
      const denom = token.denom
      if (!gecko[denom]) continue;
      token.geckoId = gecko[token.denom]
      tokenMap[denom] = token
    }
  } while (data.tokens.length)
  return tokenMap
}

async function tvl() {
  const balances = {}
  const [tokenData, pools] = await Promise.all([
    getTokenInfo(),
    getPools()
  ])
  for (const { pool: { denom_a, amount_a, denom_b, amount_b } } of pools) {
    if (tokenData[denom_a]) {
      addBalance(denom_a, amount_a)
    }
    if (tokenData[denom_b]) {
      addBalance(denom_b, amount_b)
    }
  }
  return balances

  function addBalance(id, amount) {
    sdk.util.sumSingleBalance(balances, tokenData[id].geckoId, amount / (10 ** +tokenData[id].decimals))
  }
}

module.exports = {
  timetravel: false,
  carbon: {
    tvl
  }
}