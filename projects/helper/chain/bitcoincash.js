const { utxo } = require('@defillama/sdk').chains

const CHAIN = 'bitcoincash'

// BCH balance in base units (8 decimals); accepts cashaddr (with or without the
// `bitcoincash:` prefix) and legacy base58 addresses, the sdk rotates haskoin / blockchair / tatum
async function getBalance(addr) {
  return Number(await utxo.getBalance({ chain: CHAIN, address: addr }))
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('bitcoin-cash', balance / 1e8)
  }
}

module.exports = {
  sumTokens
}
