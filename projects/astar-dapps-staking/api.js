const { ApiPromise, HttpProvider } = require("@polkadot/api");

// HTTP instead of WS: WsProvider reconnects forever when the endpoint drops, which keeps the process alive
const RPC_URLS = [
  "https://astar.api.onfinality.io/public",
  "https://rpc.astar.network",
  "https://astar-rpc.dwellir.com",
];

async function getTotalLocked(url) {
  const provider = new HttpProvider(url);
  const api = await ApiPromise.create({ provider, noInitWarn: true, throwOnConnect: true });
  try {
    const currentEraInfo = await api.query.dappStaking.currentEraInfo();
    return currentEraInfo.totalLocked.toString();
  } finally {
    await api.disconnect();
  }
}

async function tvl() {
  let lastError;
  for (const url of RPC_URLS) {
    try {
      const totalLocked = await getTotalLocked(url);
      return { astar: totalLocked / 1e18 };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

module.exports = {
  timetravel: false,
  astar: { tvl },
};
