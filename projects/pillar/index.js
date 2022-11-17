const {
  getBalances,
} = require('../helper/chain/zilliqa')

async function tvl() {
  const balances = {}

  const TOKENS = [
    "0x4306f921c982766810cf342775fd79aa2d0d0e24", // wrapped ZIL
  ]

  const CONTRACT_ADDRESS = '0x323e8105ba12d46e38d31cd674b6a2d16d76e6d1'
  const allContracts = [CONTRACT_ADDRESS,]
  await getBalances(TOKENS, allContracts, balances)
  return balances
}

module.exports = {
  zilliqa: {
    tvl,
  },
  timetravel: false,
}