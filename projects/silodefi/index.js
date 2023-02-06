const { searchAccountsAll } = require('../helper/chain/algorand')
const sdk = require('@defillama/sdk')

async function tvl() {
  const balances = {}
  const call = 913906096;
  const put = 913951447;
  const usdc = 31566704;
  const searchParams = {
    'asset-id': usdc,
    'currency-greater-than': 1000000,
  }
  const callAccounts = await searchAccountsAll({ appId: call, searchParams, limit: 100 })
  const putAccounts = await searchAccountsAll({ appId: put, searchParams, limit: 100  })
  let accounts = [...callAccounts, ...putAccounts]
  accounts = accounts.flat().filter(i => i["created-assets"] && 
  i["created-assets"].some(asset => asset.params["unit-name"] === 'SILO')
  )
  accounts.forEach(a => {
    sdk.util.sumSingleBalance(balances, 'algorand', a.amount/1e6)
    a.assets.filter(i => i['asset-id'] === usdc).forEach(i => sdk.util.sumSingleBalance(balances, 'usd-coin', i.amount/1e6))

  })
  return balances
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  }
}