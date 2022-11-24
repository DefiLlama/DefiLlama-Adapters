const sdk = require('@defillama/sdk')
const { get } = require('../http')

const url = addr => 'https://blockstream.info/api/address/'+addr

async function getBalance(addr) {
  const { chain_stats: {
    funded_txo_sum, spent_txo_sum,
  }} = await get(url(addr))

  return (funded_txo_sum - spent_txo_sum) /1e8

}

async function sumTokens({ balances = {}, owners = {}}) {
  const bitBals = await Promise.all(owners.map(getBalance))
  sdk.util.sumSingleBalance(balances,'bitcoin',bitBals.reduce((a, i) => a+i, 0))
  return balances
}

module.exports = {
  sumTokens
}