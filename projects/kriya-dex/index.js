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
    const lspType = fields.lsp_supply.type;
    const onlyTypes = lsp_type.replace('0x2::balance::Supply<', '').split("<")[1].replace(">", "").replace(">", "").replace(" ", "");
    const [typeA, typeB] = onlyTypes.split(",");
    return {
        coinX: typeA,
        coinY: typeB,
        balanceX: fields.token_x,
        balanceY: fields.token_y,
    };
}

async function kriyaTVL(_, _1, _2, { api }) {
    const poolIds = await getPoolIDs();

    for (const pool of poolIds) {
        const res = await getPoolInfo(pool)
        
        api.add(res.coinX, Number(res.balanceX));
        api.add(res.coinY, Number(res.balanceY));
    }
}

module.exports = {
    timetravel: true,
    methodology: "Collects TVL for all pools created on KriyaDEX",
    sui: {
        tvl: kriyaTVL,
    }
}