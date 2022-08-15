
const { getAPI, addTokenBalance } = require('./api')

async function dex(chain) {
  const api = await getAPI(chain)
  const data = await api.query.dex.liquidityPool.entries();
  const balances = {}

  for (let i = 0; i < data.length; i++) {
    const [token, amount] = data[i];
    const prices = {}
    await addTokenBalance({ balances, chain, amount: amount[0], tokenArg: token.args[0][0], })
    await addTokenBalance({ balances, chain, amount: amount[1], tokenArg: token.args[0][1], })
  }

  return balances
}

module.exports = {
  dex
}