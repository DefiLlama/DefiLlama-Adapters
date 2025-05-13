const sui = require("../helper/chain/sui");

const LIQUIDITY_POOL_0 = "0x98110aae0ffaf294259066380a2d35aba74e42860f1e87ee9c201f471eb3ba03";

async function tvl(api) {
  const pool = await sui.getObject(LIQUIDITY_POOL_0);

  pool.fields.token_pools.forEach((pool) => {
    const token = "0x" + pool.fields.token_type.fields.name;
    api.add(token, pool.fields.state.fields.liquidity_amount);
  });

}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
