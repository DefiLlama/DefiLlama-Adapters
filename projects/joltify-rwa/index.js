const { queryV1Beta1 } = require('../helper/chain/cosmos');
const chain = 'joltify'

const tvl = async (api) => {
  const [pools] = await Promise.all([
    queryV1Beta1({ chain, url: `spv/list_pools` }),
  ]);

  pools.pools_info.forEach(async pool => {
    api.add(pool.usable_amount.denom, pool.usable_amount.amount);
    api.add(pool.escrow_principal_amount.denom, pool.escrow_principal_amount.amount);
    api.add(pool.escrow_principal_amount.denom, pool.escrow_interest_amount);
  });
}

const borrowed = async (api) => {
  const [pools] = await Promise.all([
    queryV1Beta1({ chain, url: `spv/list_pools` }),
  ]);

  const [price_info] = await Promise.all([
    queryV1Beta1({ chain, url: `third_party/pricefeed/v1beta1/prices` }),
  ]);

  pools.pools_info.forEach(async pool => {
    const [market, borrowed_denom] = pool.borrowed_amount.denom.split('-');
    const market_id = `${market}:usd`;
    const price = price_info.prices.find(price => price.market_id === market_id)?.price;
    api.add(borrowed_denom, pool.borrowed_amount.amount * price);
  });
}

module.exports = {
  timetravel: false,
  joltify: {
    tvl,
    borrowed
  }
}