const { get } = require('./helper/http')

async function fetch() {
  const data = await get('https://backend.sovryn.app/tvl')
  const tvl = data.tvlLending.totalUsd + data.tvlAmm.totalUsd + data.tvlProtocol.totalUsd + data.tvlSubprotocols.totalUsd + data.tvlZero.totalUsd + data.tvlMynt.totalUsd;
  return tvl;
}

module.exports = {
  methodology: "Sum up TVL of all Sovryn contracts and subprotocols (Lending Protocol, AMMs, Protocol Contract that holds margin trading collateral, Zero Lending Protocol and Mynt Bitcoin-backed stablecoin protocol). This data comes from the Sovryn backend API, which is open source and can be found here: https://github.com/DistributedCollective/Sovryn-graph-wrapper",
  rsk: {
    fetch
  },
  fetch,
  hallmarks: [
    [1680685098, "Mynt and Zero added to TVL"]
  ]
}