const { FixedPointNumber, forceToCurrencyName } = require("@acala-network/sdk-core");
const { getAPI, getWallet } = require('./api')

async function dex(chain) {
  const api = await getAPI(chain)
  const wallet = await getWallet(chain)
  const data = await api.query.dex.liquidityPool.entries();
  let total = FixedPointNumber.ZERO;
  const prices = {}

  async function getPrice(token) {
    if (!prices[token]) prices[token] = wallet.getPrice(token)
    return prices[token]
  }

  for (let i = 0; i < data.length; i++) {
    const [token, amount] = data[i];
    const tokenA = await wallet.getToken(forceToCurrencyName(token.args[0][0]));
    const tokenB = await wallet.getToken(forceToCurrencyName(token.args[0][1]));
    const amountA = FixedPointNumber.fromInner(amount[0].toString(), tokenA.decimals);
    const amountB = FixedPointNumber.fromInner(amount[1].toString(), tokenB.decimals);
    const priceA = await getPrice(tokenA)
    const priceB = await getPrice(tokenB)

    if (!priceA || !priceB) continue;

    total = total.add(amountA.times(priceA)).add(amountB.times(priceB));
  }

  return {
    tether: total.toNumber()
  }
}

module.exports = {
  dex
}