const sdk = require('@defillama/sdk')

const { utxo } = sdk.chains
const CHAIN = 'bsv'

// confirmed BSV balance in whole coins (the sdk throws on whatsonchain's throttled bodies instead of counting 0)
async function getBalance(addr) {
  const satoshis = await utxo.getBalance({ chain: CHAIN, address: addr })
  return utxo.fromBaseUnits(satoshis, utxo.CHAINS[CHAIN].decimals)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  // whatsonchain rate limits aggressively, going one at a time keeps the helper from being throttled
  for (const owner of owners)
    total += await getBalance(owner)

  sdk.util.sumSingleBalance(balances, 'coingecko:bitcoin-cash-sv', total)
  return balances
}

module.exports = {
  sumTokens
}
