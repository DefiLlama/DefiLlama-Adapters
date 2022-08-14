const { FixedPointNumber, forceToCurrencyName } = require("@acala-network/sdk-core")
const { getAPI, getWallet, addTokenBalance } = require('./api')

async function lending(chain){
  const api = await getAPI(chain)
  const wallet = await getWallet(chain)
  let locked = FixedPointNumber.ZERO;

  const data = await api.query.loans.totalPositions.entries();
  const balances = {}

  for (let i = 0; i < data.length; i++) {
    const [_token, amount] = data[i];
    await addTokenBalance({ balances, chain, tokenArg: _token.args[0], amount: amount.collateral })
    // const token = await wallet.getToken(forceToCurrencyName(_token.args[0]));
    // const collateral = FixedPointNumber.fromInner(amount.collateral.toString(), token.decimals);
    // const price = await wallet.getPrice(token.name);
    // console.log(_token.args[0].toJSON(), +collateral, +price, +collateral.times(price))
    // if (_token.args[0].toJSON().liquidCrowdloan === 13) continue;

    // locked = locked.add(collateral.times(price));
  }

  return balances
}

module.exports = {
  lending
}
