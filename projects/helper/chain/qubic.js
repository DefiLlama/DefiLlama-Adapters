const RPC_ENDPOINT = "https://rpc.qubic.org"
const API_ENDPOINT = "https://api.qubic.org"

async function getBalance(publicId) {
  const balanceResult = await fetch(`${RPC_ENDPOINT}/v1/balances/${publicId}`);
  const balance = await balanceResult.json();
  if (!balance || !balance.balance) {
    console.warn("getBalance: Invalid balance");
    return {};
  }
  return balance.balance;
}

async function fetchQuerySC(query) {
  const queryResult = await fetch(`${RPC_ENDPOINT}/v1/querySmartContract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  const result = await queryResult.json();
  return result;
}

async function fetchTxStatus(txId) {
  const txStatusResult = await fetch(`${RPC_ENDPOINT}/v1/tx-status/${txId}`);
  let txStatus;
  if (txStatusResult.status === 200) {
    txStatus = await txStatusResult.json();
  }
  return txStatus.transactionStatus;
}

async function fetchLatestStats() {
  const latestStatsResult = await fetch(`${RPC_ENDPOINT}/v1/latest-stats`);
  if (!latestStatsResult.ok) {
    console.warn("fetchLatestStats: Failed to fetch latest stats");
    return {};
  }
  const latestStats = await latestStatsResult.json();
  if (!latestStats || !latestStats.data) {
    console.warn("fetchLatestStats: Invalid response data");
    return {};
  }
  return latestStats.data;
}

async function fetchRichList({ page, pageSize }) {
  const richListResult = await fetch(`${RPC_ENDPOINT}/v1/rich-list?page=${page}&pageSize=${pageSize}`);
  const richList = await richListResult.json();
  return richList;
}

async function fetchTxHistory({ publicId, startTick, endTick }) {
  const txHistoryResult = await fetch(
    `${RPC_ENDPOINT}/v2/identities/${publicId}/transfers?startTick=${startTick}&endTick=${endTick}`
  );
  const txHistory = await txHistoryResult.json();
  return txHistory.data;
}

async function fetchEpochTicks({ epoch, page, pageSize }) {
  const epochTicksResult = await fetch(
    `${RPC_ENDPOINT}/v2/epochs/${epoch}/ticks?page=${page}&pageSize=${pageSize}`
  );
  const epochTicks = await epochTicksResult.json();
  return epochTicks.data;
}

async function fetchTickEvents(tick) {
  try {
    const tickEventsResult = await fetch(`${API_ENDPOINT}/v1/events/getTickEvents`, {
      method: "POST",
      body: JSON.stringify({ tick }),
    });
    return tickEventsResult.json();
  } catch (error) {
    return null;
  }
}

module.exports = {
  RPC_ENDPOINT,
  API_ENDPOINT,
  getBalance,
  fetchQuerySC,
  fetchTxStatus,
  fetchLatestStats,
  fetchRichList,
  fetchTxHistory,
  fetchEpochTicks,
  fetchTickEvents,
};
