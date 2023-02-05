const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
let data

async function getData() {
  if (!data) data = get('https://testnet-client-bff-ocstrhuppq-uc.a.run.app/convexity/assets/all')
  return data
}

async function tvl() {
  const balances = {}
  const data = await getData()
  data.forEach(i => sdk.util.sumSingleBalance(balances, i.base_denom, i.available_liquidity_tokens * (10 ** i.exponent)))
  return transformBalances('umee', balances)
}

async function borrowed() {
  const balances = {}
  const data = await getData()
  data.forEach(i => sdk.util.sumSingleBalance(balances, i.base_denom, i.total_borrow * (10 ** i.exponent)))
  return transformBalances('umee', balances)
}

module.exports = {
  timetravel: false,
  methodology: "Total supplied assets - total borrowed assets",
  umee: {
    tvl,
    borrowed,
  },
};
