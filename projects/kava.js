const { queryV1Beta1 } = require('./helper/chain/cosmos');

const chain = 'kava'
async function tvl(_, _1, _2, { api }) {
  const { total_collateral: pools } = await queryV1Beta1({ chain, url: 'cdp/v1beta1/totalCollateral' });
  pools.forEach(({ amount: { denom, amount} }) => api.add(denom, amount))
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};