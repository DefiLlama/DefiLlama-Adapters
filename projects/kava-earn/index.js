const { queryV1Beta1 } = require('../helper/chain/cosmos');

const chain = 'kava'

async function tvl(api) {
  const { result: pools } = await queryV1Beta1({ chain, url: '/earn/v1beta1/total_supply' });
  pools.forEach(({ denom, amount }) => api.add(denom, amount))
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};