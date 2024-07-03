const { sumTokensExport } = require('../helper/unknownTokens')

const creditDatabaseContract = '0xf79B598E856858527573cE0771b872C88887a055'
const microcreditInvestmentContract = '0x3B724e84Fd7479C1bed10cAf8eed825dad852C1b'
const microcreditProfitShareContract = '0x78ed6350E3E4A0Fa59C48DA702d66cEe90F38BDB'

const fakeUsdt = '0xe5CeD8244f9F233932d754A0B1F7268555FBd3B5'
const fakeMct = '0x829e43f497b8873fA5c83FcF665b96A39a1FBeD6'

async function tvl(api) {
  const balances = {}
  const contracts = [
    creditDatabaseContract,
    microcreditInvestmentContract,
    microcreditProfitShareContract,
  ]
  
  const tokens = [
    fakeUsdt,
    fakeMct,
  ]

  for (const contract of contracts) {
    for (const token of tokens) {
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [contract],
      })
      api.add(balances, token, balance)
    }
  }

  return balances
}

module.exports = {
  haqq: {
    tvl,
  },
  methodology: 'counts the number of fake USDT and MCT tokens in the CreditDatabase, MicrocreditInvestment, and MicrocreditProfitShare contracts.',
}
