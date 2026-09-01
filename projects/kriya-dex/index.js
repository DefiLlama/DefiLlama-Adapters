const sui = require('../helper/chain/sui')

const POOL_TYPE = "0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::Pool";

async function kriyaTVL(api) {
  const pools = await sui.getObjectsByType(POOL_TYPE)
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