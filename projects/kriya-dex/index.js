const sui = require('../helper/chain/sui')

const EVENT_FILTER = "0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::PoolCreatedEvent";

async function kriyaTVL(api) {
  const poolIds = await sui.queryEvents({ eventType: EVENT_FILTER, transform: i => i.pool_id});
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