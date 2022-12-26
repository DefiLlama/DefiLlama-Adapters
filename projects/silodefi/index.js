const { searchAccountsAll } = require('../helper/chain/algorand')
const sdk = require('@defillama/sdk')

async function tvl() {
  const balances = {}
  const call = 913906096;
  const put = 913951447;
  const usdc = 31566704;
  let accounts = await Promise.all([call, put].map(appId => searchAccountsAll({ appId })))
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