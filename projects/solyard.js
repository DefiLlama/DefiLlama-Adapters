const { sumTokens2 } = require('./helper/solana')

async function staking() {
  return sumTokens2({ tokenAccounts: ['Gcdr3WtnnCW1SCDoLQNWXBtmt7xt4x9GEroz3zAfMWys']})
}

module.exports = {
  deadFrom: '2022-06-30',
  timetravel: false,
  solana: {
    tvl: () => ({}),
    staking,
    pool2: () => ({}),
  },
}
