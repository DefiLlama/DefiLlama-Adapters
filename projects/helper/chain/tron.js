const { get, post, } = require('../http')

async function getStakedTron(account) {
  const data = await get(`https://apilist.tronscan.org/api/vote?candidate=${account}`)
  return data.totalVotes
}

async function getTrxBalance(account) {
  const data = await post('https://api.trongrid.io/wallet/getaccount', {
    address: account,
    visible: true,
  })
  return data.balance + (data.frozen?.reduce((t, { frozen_balance }) => t + frozen_balance, 0) ?? 0)
}

module.exports = {
  getStakedTron,
  getTrxBalance,
}
