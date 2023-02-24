const { FixedPointNumber, forceToCurrencyName } = require("@acala-network/sdk-core");
const { getAPI, getWallet } = require('./api')

async function dexStaking(chain){
  const api = await getAPI(chain)
  const wallet = await getWallet(chain)
  const data = await api.query.rewards.poolInfos.entries();
  let total = FixedPointNumber.ZERO;
  const filterData = data.filter(([token]) => {
    return token.toHuman()[0].Dex
  });

  for (let i = 0; i < filterData.length; i++) {
    const [token, amount] = filterData[i];

    const lpToken = await wallet.getToken(forceToCurrencyName(token.args[0].asDex));
    const totalShares = FixedPointNumber.fromInner(amount.totalShares.toString(), lpToken.decimals);
    const price = await wallet.getPrice(lpToken.name);

    total = total.add(totalShares.times(price));
  }

  return {
    tether: total.toNumber()
  }
}

module.exports = {
  dexStaking
}
