const { queryV1Beta1 } = require('./helper/chain/cosmos');

async function tvl(api) {
  const data = await queryV1Beta1({ chain: 'kava', url: '/bep3/v1beta1/assetsupply/bnb'}) // https://swagger.kava.io/#/BEP3/BEP3AssetSupply
  api.addGasToken(data.asset_supply.current_supply.amount* 1e10)
}

module.exports = {
  timetravel: false,
  bsc: { tvl }
};