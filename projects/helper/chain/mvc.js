const { get } = require('../http')

async function getMvcBalance(addr) {
  const res = await get(`https://mainnet.mvcapi.com/address/${addr}/balance`)
  return res.confirmed
}

module.exports = {
  getMvcBalance,
}