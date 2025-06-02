const sdk = require('@defillama/sdk')
const axios = require('axios')

const getPerpPools = async () => {
  const pools = [];
  const size = 100;

  for (let skip = 0; ; skip += size) {
    const api = `https://api.carbon.network/carbon/perpspool/v1/pools/pool_info?pagination.limit=${size}&pagination.offset=${skip}`
    const { data } = await axios(api)
    const currentPools = data.vaults || []
    pools.push(...currentPools)
    if (currentPools.length < size) break
  }

  return pools
}

const getPools = async () => {
  const pools = [];
  const size = 100;

  for (let skip = 0; ; skip += size) {
    const api = `https://api.carbon.network/carbon/liquiditypool/v1/pools?pagination.limit=${size}&pagination.offset=${skip}`
    const { data } = await axios(api)
    const currentPools = data.pools || []
    pools.push(...currentPools)
    if (currentPools.length < size) break
  }

  return pools
}

const getTokenInfo = async () => {
  const { data } = await axios('https://api-insights.carbon.network/info/denom_gecko_map')
  const { gecko } = data.result
  const tokenMap = {}
  const size = 100

  for (let skip = 0; ; skip += size) {
    const api = `https://api.carbon.network/carbon/coin/v1/tokens?pagination.limit=${size}&pagination.offset=${skip}`
    const res = await axios(api)
    const data = res.data
    const tokens = data.tokens || []

    for (const token of tokens) {
      const denom = token.denom
      if (!gecko[denom]) continue
      token.geckoId = gecko[denom]
      tokenMap[denom] = token
    }

    if (tokens.length < size) break
  }

  return tokenMap
}

async function tvl() {
  const balances = {}
  const [tokenData, pools, perpPools] = await Promise.all([getTokenInfo(), getPools(), getPerpPools()])
  for (const { pool: { denom_a, amount_a, denom_b, amount_b } } of pools) {
    if (tokenData[denom_a]) {
      addBalance(denom_a, amount_a)
    }
    if (tokenData[denom_b]) {
      addBalance(denom_b, amount_b)
    }
  }

  const perpPoolDenom = 'cgt/1' // Carbon USD
  for (const { total_nav_amount } of perpPools) {
    if (tokenData[perpPoolDenom]) {
      addBalance(perpPoolDenom, total_nav_amount)
    }
  }

  return balances

  function addBalance(id, amount) {
    sdk.util.sumSingleBalance(balances, tokenData[id].geckoId, amount / (10 ** +tokenData[id].decimals))
  }
}

module.exports = {
  timetravel: false,
  carbon: { tvl }
}