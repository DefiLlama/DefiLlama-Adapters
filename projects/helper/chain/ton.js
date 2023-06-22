const { get } = require('../http')

async function getTonBalance(addr) {
  const res = await get(`https://tonapi.io/v1/account/getInfo?account=${addr}`)
  return res.balance
}

module.exports = {
  getTonBalance,
}