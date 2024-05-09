const { transformBalances } = require('../portedTokens');
const { getAPI, addTokenBalance } = require('./api')

async function lending(chain){
  const api = await getAPI(chain)

  const data = await api.query.loans.totalPositions.entries();
  const balances = {}

  for (let i = 0; i < data.length; i++) {
    const [_token, amount] = data[i];
    addTokenBalance({ balances, chain, tokenArg: _token.args[0], amount: amount.collateral })
  }

  return transformBalances(chain, balances)
}

module.exports = {
  lending
}
