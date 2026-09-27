const { utxo } = require('@defillama/sdk').chains

// confirmed MVC balance in base units (number)
async function getMvcBalance(addr) {
  return Number(await utxo.getBalance({ chain: 'mvc', address: addr }))
}

module.exports = {
  getMvcBalance,
}
