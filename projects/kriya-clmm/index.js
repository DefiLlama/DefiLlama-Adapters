const sui = require("../helper/chain/sui");

const EVENT_FILTER =
  "0xf6c05e2d9301e6e91dc6ab6c3ca918f7d55896e1f1edd64adc0e615cde27ebf1::create_pool::PoolCreatedEvent";

async function kriyaTVL(api) {
  const poolIds = await sui.queryEvents({
    eventType: EVENT_FILTER,
    transform: (i) => i.pool_id,
  });
  const pools = await sui.getObjects(poolIds);
  pools.forEach((i) => {
    const [token0, token1] = i.type.split("<")[1].replace(">", "").split(", ");
    api.add(token0, i.fields.reserve_x);
    api.add(token1, i.fields.reserve_y);
  });
}

module.exports = {
  timetravel: false,
  methodology: "Collects TVL for all CLMM pools created on Kriya",
  sui: {
    tvl: kriyaTVL,
  },
};
