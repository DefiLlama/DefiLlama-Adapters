const { get } = require('./helper/http')

async function tvl() {
  const data = await get('https://api2.kava.io/kava/bep3/v1beta1/assetsupply/bnb') // https://swagger.kava.io/#/BEP3/BEP3AssetSupply
  return { 'binancecoin': data.asset_supply.current_supply.amount / 1e8 };
}

module.exports = {
  timetravel: false,
  bsc: { tvl }
};