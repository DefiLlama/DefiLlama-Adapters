const sdk = require('@defillama/sdk')
const { PromisePool } = require('@supercharge/promise-pool')

const { utxo } = sdk.chains
const CHAIN = 'litecoin'

// LTC balance in whole coins
async function getBalance(addr) {
  const litoshis = await utxo.getBalance({ chain: CHAIN, address: addr })
  return utxo.fromBaseUnits(litoshis, utxo.CHAINS[CHAIN].decimals)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  const { errors } = await PromisePool
  .withConcurrency(5)
  .for(owners)
  .process(async owner => {
    const balance = await getBalance(owner)
    total += balance
  })
  if (errors && errors.length) throw errors[0]
  sdk.util.sumSingleBalance(balances, 'litecoin', total)
  return balances
}

module.exports = {
  sumTokens
}
