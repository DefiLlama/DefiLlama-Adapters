const { utxo } = require('@defillama/sdk').chains

const CHAIN = 'zcash'

// ZEC balance in zatoshi (8 decimals); blockchair's free tier is paced inside the sdk
async function getBalance(addr) {
  return Number(await utxo.getBalance({ chain: CHAIN, address: addr }))
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('zcash', balance / 1e8)
  }
  return api.getBalances()
}

module.exports = {
  getBalance,
  sumTokens,
}
