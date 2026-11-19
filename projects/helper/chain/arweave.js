const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { PromisePool } = require('@supercharge/promise-pool')

const url = addr => 'https://arweave.net/wallet/' + addr + '/balance'

async function getBalance(addr) {
  const balance = await get(url(addr))
  return +balance / 1e12 // winston -> AR
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  await PromisePool
    .withConcurrency(5)
    .for(owners)
    .process(async owner => {
      total += await getBalance(owner)
    })

  sdk.util.sumSingleBalance(balances, 'coingecko:arweave', total)
  return balances
}

module.exports = {
  sumTokens
}
