const { FixedPointNumber, forceToCurrencyName } = require("@acala-network/sdk-core")
const { getAPI, getWallet } = require('./api')

async function lending(chain){
  const api = await getAPI(chain)
  const wallet = await getWallet(chain)
  let locked = FixedPointNumber.ZERO;

  const data = await api.query.loans.totalPositions.entries();

  for (let i = 0; i < data.length; i++) {
    const [_token, amount] = data[i];
    const token = await wallet.getToken(forceToCurrencyName(_token.args[0]));
    const collateral = FixedPointNumber.fromInner(amount.collateral.toString(), token.decimals);
    const price = await wallet.getPrice(token.name);

    locked = locked.add(collateral.times(price));
  }

  return {
    tether: +locked.toString(),
  }
}

module.exports = {
  lending
}
