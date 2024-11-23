const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens } = require('../helper/chain/radixdlt');

const staking_pools = [
  'component_rdx1cqzle2pft0y09kwzaxy07maczpwmka9xknl88glwc4ka6a7xavsltd'
]


async function tvl(api) {
  return sumTokens({ owners: staking_pools, api });
}

module.exports = {
  radixdlt: { tvl },
  timetravel: false,
};
