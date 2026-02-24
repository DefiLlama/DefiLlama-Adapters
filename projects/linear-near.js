const ADDRESSES = require('./helper/coreAssets.json')
const { call } = require('./helper/chain/near')

async function tvl() {
    return { 
      near: (await call(
        ADDRESSES.near.LINA, 
        'get_total_staked_balance', 
        {}
      ) / 1e24 )
    };
}

module.exports = {
  near: {
    tvl
  },
  timetravel: false,
};