const { utxo } = require('@defillama/sdk').chains

const CHAIN = 'doge'

// DOGE balance in base units (8 decimals); the sdk paces blockcypher / tatum calls
async function getBalance(addr) {
  return Number(await utxo.getBalance({ chain: CHAIN, address: addr }))
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('dogecoin', balance / 1e8)
  }
}

module.exports = {
  sumTokens
}
