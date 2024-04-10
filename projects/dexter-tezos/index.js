const { get } = require('../helper/http')

async function tvl(api) {
  const tsString = new Date(api.timestamp * 1000).toISOString()
  const addBal = bal => api.add('coingecko:tezos', bal * 2/ 1e6, { skipChain: true })
  const getBal = async (address) =>  get(`https://api.tzkt.io/v1/accounts/${address}/balance_history/${tsString}`)

  const owners = [
    'KT1Puc9St8wdNoGtLiD2WXaHbWU7styaxYhD',
    'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9',
    'KT1DrJV8vhkdLEj76h1H9Q4irZDqAkMPo1Qf',
    'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N',
    'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6',
    'KT19c8n5mWrqpxMcR3J687yssHxotj88nGhZ',
    'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU',
  ]

  if (api.timestamp < 1613861579 && api.timestamp > 1612738379)
    owners.push('KT1Xf2Cwwwh67Ycu7E9yd3UhsABQC4YZPkab')


  await Promise.all(owners.map(i => getBal(i).then(addBal)))
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  tezos: {
    tvl,
  }
}