const sui = require("../helper/chain/sui");

const POOL_REGISTRY = "0xc855dba7472b2c192ab71c0b885c1755de56a10557e486ec30d0aab546e46935";

async function tvl(api) {
  const registry = await sui.getObject(POOL_REGISTRY);
  const nodes = await sui.getDynamicFieldObjects({
    parent: registry.fields.krafted_pools_list.fields.id.id,
  });
  const poolIds = nodes.map(i => i.fields.value.fields.value);
  const pools = await sui.getObjects(poolIds);

  pools.forEach(({ type, fields }) => {
    const tokens = type.replace(">", "").split("<")[1].split(", ");
    api.add(tokens[0], fields.coin_x_reserve);
    api.add(tokens[1], fields.coin_y_reserve);
  });
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the total value of assets locked in HoneyPlay AMM liquidity pools.",
  sui: { tvl },
};
