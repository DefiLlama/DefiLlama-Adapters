const { tron } = require('@defillama/sdk').chains

// total votes received by a super representative candidate (tronscan)
async function getStakedTron(account) {
  return tron.getStakedTron({ address: account })
}


// TRX balance in SUN including frozen resources (number)
async function getTrxBalance(account) {
  return Number(await tron.getTrxBalance({ address: account }))
}

module.exports = {
  getStakedTron,
  getTrxBalance,
}
