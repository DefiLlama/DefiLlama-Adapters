const { sumTokens2 } = require('../helper/solana')
const sdk = require('@defillama/sdk')

async function staking() {
  const esHRXOKey = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
  const balances = await sumTokens2({
    tokenAccounts: [
      '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
      '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    ]
  })

  if (balances[esHRXOKey]) {
    sdk.util.sumSingleBalance(balances, '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', balances[esHRXOKey], 'solana')
    delete balances[esHRXOKey]
  }
  return balances
}

module.exports = {
  solana: {
    tvl: () => 0, staking,
  }
}
