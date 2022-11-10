
const { getAPI, addTokenBalance } = require('./api')

async function dex(chain) {
  const api = await getAPI(chain)
  const data = await api.query.dex.liquidityPool.entries();
  const balances = {}

  const promises = []

  for (let i = 0; i < data.length; i++) {
    const [token, amount] = data[i];
    promises.push(addTokenBalance({ balances, chain, amount: amount[0], tokenArg: token.args[0][0], }))
    promises.push(addTokenBalance({ balances, chain, amount: amount[1], tokenArg: token.args[0][1], }))
  }

  await Promise.all(promises)
  return balances
}

module.exports = {
  dex
}