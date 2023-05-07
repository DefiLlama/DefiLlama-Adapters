const sui = require('../helper/chain/sui')

const EVENT_FILTER = "0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::PoolCreatedEvent";

async function getPoolIDs() {
  const queryObject = { MoveEventType: EVENT_FILTER };
  const queryRes = await sui.queryEvents(queryObject);
  const poolIds = queryRes.map((event) => event.parsedJson.pool_id);
  return poolIds;
}

async function kriyaTVL(_, _1, _2, { api }) {
  const poolIds = await getPoolIDs();
  const pools = await sui.getObjects(poolIds)
  pools.forEach(i => {
    const [token0, token1] = i.type.split('<')[1].replace('>', '').split(', ')
    api.add(token0, i.fields.token_x)
    api.add(token1, i.fields.token_y)
  })
}

module.exports = {
  timetravel: false,
  methodology: "Collects TVL for all pools created on KriyaDEX",
  sui: {
    tvl: kriyaTVL,
  }
}