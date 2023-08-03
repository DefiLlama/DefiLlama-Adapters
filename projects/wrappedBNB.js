const { queryV1Beta1 } = require('./helper/chain/cosmos');
const { transformBalances } = require('./helper/portedTokens')

const chain = 'kava'

async function tvl() {
  const data = await queryV1Beta1({ chain, url: '/bep3/v1beta1/assetsupply/bnb'}) // https://swagger.kava.io/#/BEP3/BEP3AssetSupply
  return transformBalances(chain, { bnb: data.asset_supply.current_supply.amount})
}

module.exports = {
  timetravel: false,
  bsc: { tvl }
};