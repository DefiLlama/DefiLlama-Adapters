const { get } = require("../helper/http")
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

async function getTotalSupplied() { 
  const modAddress = 'swth1wq9ts6l7atfn45ryxrtg4a2gwegsh3xh7w83xl'
  const debtInfos = (await get('https://api.carbon.network/carbon/cdp/v1/token_debt')).debt_infos_all
  const modBalances = (await get(`https://api.carbon.network/carbon/coin/v1/balances/${modAddress}`)).token_balances
  const allAssets = []
  for (const debt of debtInfos){
    const {denom,total_principal} = debt
    const modBalance = new BigNumber((modBalances.find((o) => o.denom === denom))?.available ?? 0)
    const totalPrincipal = new BigNumber(total_principal ?? 0)
    allAssets.push({ denom, amount: modBalance.plus(totalPrincipal).toNumber()})
  }
  return allAssets
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
  const [tokenData, assets] = await Promise.all([
    getTokenInfo(),
    getTotalSupplied()
  ])

  for(const {denom, amount} of assets) {
    if (tokenData[denom]) {
      addBalance(denom, amount)
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