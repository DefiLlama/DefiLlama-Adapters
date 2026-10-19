const sdk = require('@defillama/sdk')
const { PromisePool } = require('@supercharge/promise-pool')

const { utxo } = sdk.chains
const CHAIN = 'kaspa'

// KAS balance in whole coins
async function getBalance(addr) {
  const sompi = await utxo.getBalance({ chain: CHAIN, address: addr })
  return utxo.fromBaseUnits(sompi, utxo.CHAINS[CHAIN].decimals)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  await PromisePool
    .withConcurrency(5)
    .for(owners)
    .process(async owner => {
      total += await getBalance(owner)
    })

  sdk.util.sumSingleBalance(balances, 'coingecko:kaspa', total)
  return balances
}

module.exports = {
  sumTokens
}
