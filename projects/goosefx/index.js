const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ owner: 'ALfS4oPB5684XwTvCjWw7XddFfmyTNdcY7xHxbh2Ui8s'})
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['D9DhGq6MctzCzABhFybyuj3KHj3QbeG5H3JzXMGysY3T'] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}