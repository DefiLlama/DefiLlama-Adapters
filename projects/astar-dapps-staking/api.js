const { ApiPromise, WsProvider } = require("@polkadot/api");

async function tvl() {
  const polkadotProvider = new WsProvider("wss://rpc.astar.network");
  const polkadotApi = await ApiPromise.create({ provider: polkadotProvider });
  const currentEraInfo = await polkadotApi.query.dappStaking.currentEraInfo();
  const tvl = currentEraInfo.totalLocked.toString()
  return {
    astar: tvl / 1e18,
  };
}

module.exports = {
  timetravel: false,
  astar: { tvl },
};