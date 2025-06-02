const { queryV1Beta1 } = require('../helper/chain/cosmos');

const chain = 'kava'
const blacklisted = new Set(['kava', 'ukava', 'bkava'])

async function tvl(api) {
  const { result: pools } = await queryV1Beta1({ chain, url: '/savings/v1beta1/total_supply' });
  pools
    .filter(({ denom }) => !blacklisted.has(denom))
    .forEach(({ denom, amount }) =>  api.add(denom, amount))
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};