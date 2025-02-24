const { getEnv } = require('../env')
const { get, post, } = require('../http')

async function getStakedTron(account) {
  const data = await get(`https://apilist.tronscan.org/api/vote?candidate=${account}`)
  return data.totalVotes
}


// not used anywhere?
async function getTrxBalance(account) {
  console.log(getEnv('TRON_RPC')+'/wallet/getaccount')
  const data = await post(getEnv('TRON_RPC')+'/wallet/getaccount', {
    address: account,
    visible: true,
  })
  return data.balance + (data.frozen?.reduce((t, { frozen_balance }) => t + frozen_balance, 0) ?? 0)
}

module.exports = {
  getStakedTron,
  getTrxBalance,
}
