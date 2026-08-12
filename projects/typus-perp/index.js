const sui = require("../helper/chain/sui");

const LIQUIDITY_POOL = "0x9090a55fea75d0b135dfa53e6bbe234c0b0e9d0e0b21c615f32f0048bc35aca4";

async function tvl(api) {
  const pools = await sui.getDynamicFieldObjects({
    parent: LIQUIDITY_POOL,
  });

  pools.forEach(({ fields }) => {
    fields.token_pools.forEach((pool) => {
      const token = "0x" + pool.fields.token_type.fields.name;
      api.add(token, pool.fields.state.fields.liquidity_amount);
    });
  });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl,
  },
};
