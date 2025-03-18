const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { PromisePool } = require('@supercharge/promise-pool')

// const url = addr => 'https://chainz.cryptoid.info/ltc/api.dws?q=getbalance&a=' + addr
const url1 = addr => 'https://ltc.tokenview.io/api/address/balancetrend/ltc/' + addr
const url = addr => 'https://litecoinspace.org/api/address/' + addr

async function getBalance(addr) {
  try {
    const {chain_stats} = await get(url(addr))
    return (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) / 1e8
  } catch (e) {
    console.error(e)
    return getBalance1(addr)
  }
}

async function getBalance1(addr) {
  // return get(url(addr))
  const {data} = await get(url(addr))
  return +Object.values(data[0])[0]
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  await PromisePool
  .withConcurrency(5)
  .for(owners)
  .process(async owner => {
    const balance = await getBalance(owner)
    total += balance
  })
  sdk.util.sumSingleBalance(balances, 'litecoin', total)
  return balances
}

module.exports = {
  sumTokens
}