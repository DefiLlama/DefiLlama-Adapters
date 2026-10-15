const sdk = require('@defillama/sdk')

const { utxo } = sdk.chains
const CHAIN = 'bitcoincash'

async function sumTokens({ balances = {}, owners = [] }) {
  const satoshis = await utxo.getTotalBalance({ chain: CHAIN, addresses: owners })
  sdk.util.sumSingleBalance(balances, 'coingecko:bitcoin-cash', utxo.fromBaseUnits(satoshis, utxo.CHAINS[CHAIN].decimals))
  return balances
}

module.exports = {
  sumTokens
}
