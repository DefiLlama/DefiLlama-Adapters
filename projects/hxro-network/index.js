const { sumTokens2 } = require('../helper/solana')
const sdk = require('@defillama/sdk')

async function staking() {
  const esHRXOKey = 'solana:CPwspzHc4bKtBQGNRhpRG9v3qRiPLWP28GrfZepwmBSz'
  const balances = await sumTokens2({
    tokenAccounts: [
      '6kU9EA8ApkD3eCYjoR3e8MkJzvjcVb8nTFUQhGKMjA7r',
      'DB8v2eyqQXueoSLYNFoxoBv1DFr7XuhMLtwPUEcrM5KP',
    ]
  })

  if (balances[esHRXOKey]) {
    sdk.util.sumSingleBalance(balances, 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', balances[esHRXOKey], 'solana')
    delete balances[esHRXOKey]
  }
  return balances
}

module.exports = {
  solana: {
    tvl: () => 0, staking,
  }
}