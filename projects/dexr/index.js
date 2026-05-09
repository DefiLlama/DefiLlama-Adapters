const CHAIN = "base";
const CONTRACT = "0x4859608579D0f01605F6824ea173072a7Cc206c5";
const WETH_BASE = "0x4200000000000000000000000000000000000006";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// SwapExecuted event topic
const SWAP_TOPIC =
  "0xdd4c67c6f3ac40c1172614cde8156b024bd3d41f6891c92bf6c04ad9c83ffd95";

async function fetchSwapLogs(fromBlock, toBlock) {
  try {
    const res = await fetch("https://mainnet.base.org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getLogs",
        params: [
          {
            address: CONTRACT,
            topics: [SWAP_TOPIC],
            fromBlock: "0x" + fromBlock.toString(16),
            toBlock: "0x" + toBlock.toString(16),
          },
        ],
      }),
    });

    const json = await res.json();

    // Handle RPC errors gracefully (rate limit, upstream issue, etc.)
    if (json.error || !Array.isArray(json.result)) {
      console.error("RPC error:", json.error);
      return [];
    }

    return json.result;
  } catch (e) {
    console.error("fetchSwapLogs failed:", e);
    return [];
  }
}

function decodeSwapLog(log) {
  const data = log.data.slice(2);
  const chunk = (i) => data.slice(i * 64, (i + 1) * 64);
  const tokenIn = "0x" + chunk(0).slice(24);
  const amountIn = BigInt("0x" + chunk(2));
  return { tokenIn, amountIn };
}

async function fetch(timestamp, chainBlocks) {
  const toBlock = chainBlocks[CHAIN];
  const fromBlock = toBlock - 43200; // ~24h on Base (2s blocks)

  const logs = await fetchSwapLogs(fromBlock, toBlock);

  const volumeByToken = {};

  for (const log of logs) {
    const { tokenIn, amountIn } = decodeSwapLog(log);
    const token =
      tokenIn.toLowerCase() === ZERO_ADDRESS
        ? WETH_BASE.toLowerCase()
        : tokenIn.toLowerCase();

    volumeByToken[token] = (volumeByToken[token] ?? BigInt(0)) + amountIn;
  }

  const dailyVolume = {};
  for (const [token, amount] of Object.entries(volumeByToken)) {
    dailyVolume[`${CHAIN}:${token}`] = amount.toString();
  }

  return { dailyVolume, timestamp };
}

module.exports = {
  adapter: {
    [CHAIN]: {
      fetch,
      start: async () => 1746316800, // 2026-05-04
      runAtCurrTime: true,
    },
  },
};
