const { get, } = require('../http')

async function getStakedTron(account) {
  const data = await get(`https://apilist.tronscan.org/api/vote?candidate=${account}`)
  return data.totalVotes
}

module.exports = {
  getStakedTron,
}
