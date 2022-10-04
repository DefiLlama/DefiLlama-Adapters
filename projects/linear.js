const { call } = require('./helper/near')

async function tvl() {
    return { 
      near: (await call(
        'linear-protocol.near', 
        'get_total_staked_balance', 
        {}
      ) / 1e24 )
    };
};

module.exports = {
  near: {
    tvl
  },
  timetravel: false,
};