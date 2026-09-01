const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/near')

async function tvl() {
  const here_balance = await call("storage.herewallet.near", 'ft_total_supply', {});
  return {
    near: (here_balance / 1e24)
  };
}

module.exports = {
  near: {
    tvl
  },
  timetravel: false,
};