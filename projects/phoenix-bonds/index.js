const { call } = require('../helper/chain/near')

async function tvl() {
  const linear_price = await call(
    'linear-protocol.near', 
    'ft_price', 
    {}
  );
  const { linear_balance } = await call(
    'phoenix-bonds.near', 
    'get_summary', 
    {
      "linear_price": linear_price
    }
  );
  return { 
    near: ( linear_price / 1e24 ) * (linear_balance / 1e24)
  };
}

module.exports = {
  near: {
    tvl
  },
  timetravel: false,
};