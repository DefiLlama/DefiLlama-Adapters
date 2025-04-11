const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ tokenAccounts: ['ALfS4oPB5684XwTvCjWw7XddFfmyTNdcY7xHxbh2Ui8s']})
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['24dximAcSUp1aM3uyQ7Cdpsg128ZVpYRwJBz5k4P6HMc'] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}