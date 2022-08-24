const { sumTokens2 } = require('./helper/solana')

async function tvl() {
  return sumTokens2({
    tokenAccounts: [
      '6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S',
      'Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ',
    ]
  })
}

module.exports = {
  timetravel: false,
  methodology: "Calculate the USDC on 6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S through on-chain calls & add the USDC on Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ which is the insurance fund for liquidations",
  solana: {
    tvl
  }
}
