const { get } = require('./helper/http')
async function fetch() {
  let tvl_feed = await get('https://backend.sovryn.app/tvl')
  let tvl = tvl_feed.tvlLending.totalUsd + tvl_feed.tvlAmm.totalUsd + tvl_feed.tvlProtocol.totalUsd + tvl_feed.tvlSubprotocols.totalUsd;
  return tvl;
}

module.exports = {
  rsk: {
    fetch
  },
  fetch
}
