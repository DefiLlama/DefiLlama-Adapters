const { sumTokens2 } = require('../helper/solana')

async function staking() {
  return sumTokens2({tokenAccounts: ['5EZiwr4fE1rbxpzQUWQ6N9ppkEridNwbH3dU3xUf7wPZ']})
}

const treasury = "6qfyGvoUqGB6AQ7xLc4pVwFNdgJSbAMkTtKkBXhLRiV1"
async function tvl() {
  return sumTokens2({ owner: treasury  })
}


module.exports = {
  deadFrom: 1648765747,
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  solana: {
    tvl,
    staking
  }
}
