const sui = require("../helper/chain/sui");

const EVENT_FILTER =
    "0x70285592c97965e811e0c6f98dccc3a9c2b4ad854b3594faab9597ada267b860::create_pool::PoolCreatedEvent";

async function momentumTVL(api) {
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
    methodology: "Collects TVL for all CLMM pools created on Momentum",
    sui: {
        tvl: momentumTVL,
    },
};
