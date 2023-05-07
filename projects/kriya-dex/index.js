const sui = require('../helper/chain/sui')

const EVENT_FILTER = "0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::PoolCreatedEvent";

const getPoolIDs = async () => {
    const queryObject = { MoveEventType: EVENT_FILTER };
    const queryRes = await sui.queryEvents(queryObject);
    const poolIds = queryRes.map((event) => event.parsedJson.pool_id);
    return poolIds;
}

const getPoolInfo = async (poolId) => {
    const { fields } = await sui.getObject(poolId);
    const lsp_type = fields.lsp_supply.type;
    const onlyTypes = lsp_type.replace('0x2::balance::Supply<', '').split("<")[1].replace(">", "").replace(">", "").replace(" ", "");
    const [typeA, typeB] = onlyTypes.split(",");
    return {
        coin_x: typeA,
        coin_y: typeB,
        balance_x: fields.token_x,
        balance_y: fields.token_y,
    };
}

async function kriyaTVL(_, _1, _2, { api }) {
    const poolIds = await getPoolIDs();

    for (const pool of poolIds) {
        const res = await getPoolInfo(pool)
        
        api.add(res.coin_x, Number(res.balance_x));
        api.add(res.coin_y, Number(res.balance_y));
    }
}

module.exports = {
    timetravel: true,
    methodology: "Collects TVL for all pools created on KriyaDEX, including community pools",
    sui: {
        tvl: kriyaTVL,
    }
}