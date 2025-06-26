const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
  return sumTokens2({ tokenAccounts: ['FhTJEGXVwj4M6NQ1tPu9jgDZUXWQ9w2hP89ebZHwrJPS'] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  }
}