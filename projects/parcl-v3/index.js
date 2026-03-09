const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  // https://docs.parcl.co/addresses
  return sumTokens2({ tokenAccounts: ['3parcLrT7WnXAcyPfkCz49oofuuf2guUKkjuFkAhZW8Y'] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
