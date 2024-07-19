const { sumTokens2 } = require('./helper/solana')

async function tvl() {
  const owner = '7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW'
  return sumTokens2({  owner })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted',
}
