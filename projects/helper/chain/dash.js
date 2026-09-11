const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { PromisePool } = require('@supercharge/promise-pool')

const url = addr => 'https://insight.dash.org/insight-api/addr/' + addr

async function getBalance(addr) {
  const { balance } = await get(url(addr))
  return balance
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
  sdk.util.sumSingleBalance(balances, 'dash', total)
  return balances
}

module.exports = {
  sumTokens
}
