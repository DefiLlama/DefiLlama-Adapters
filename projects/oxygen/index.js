const { sumTokens2 } = require('../helper/solana')


async function tvl(api) {
  return sumTokens2({ owner: '4ncyWnbG22vqEmyxTfBsEdbNuQhBphaasg5q5YgoiPgq', getAllTokenAccounts: true})
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed: () => 0,
  },
}
