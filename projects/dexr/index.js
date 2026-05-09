const { request } = require("graphql-request");

// ─── Constants ───────────────────────────────────────────────────────────────

const CHAIN = "base";
const CONTRACT = "0x4859608579D0f01605F6824ea173072a7Cc206c5";

// SwapExecuted(address user, uint8 adapterId, address tokenIn, address tokenOut,
//              uint256 amountIn, uint256 amountOut, uint256 feeAmount)
const SWAP_EXECUTED_TOPIC =
  "0xdd4c67c6f3ac40c1172614cde8156b024bd3d41f6891c92bf6c04ad9c83ffd95";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch swap logs from a public RPC for a given block range.
 * Returns an array of parsed log objects.
 */
async function fetchSwapLogs(fromBlock, toBlock) {
  const rpc = "https://mainnet.base.org";

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getLogs",
    params: [
      {
        address: CONTRACT,
        topics: [SWAP_EXECUTED_TOPIC],
        fromBlock: "0x" + fromBlock.toString(16),
        toBlock: "0x" + toBlock.toString(16),
      },
    ],
  });

  const res = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await res.json();
  return json.result ?? [];
}

/**
 * Decode a SwapExecuted log.
 * Non-indexed data layout (each 32 bytes):
 *   [0] tokenIn   [1] tokenOut   [2] amountIn   [3] amountOut   [4] feeAmount
 */
function decodeSwapLog(log) {
  const data = log.data.slice(2); // strip 0x
  const chunk = (i) => data.slice(i * 64, (i + 1) * 64);

  const tokenIn  = "0x" + chunk(0).slice(24);   // address (last 20 bytes)
  const tokenOut = "0x" + chunk(1).slice(24);
  const amountIn = BigInt("0x" + chunk(2));

  return { tokenIn, tokenOut, amountIn };
}

// ─── Volume adapter ───────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const WETH_BASE    = "0x4200000000000000000000000000000000000006";

/**
 * Sum raw amountIn values per token for all swaps in the given block range.
 * Returns { dailyVolume: { [tokenAddress]: BigInt } }
 */
async function getVolume(timestamp, fromBlock, toBlock) {
  const logs = await fetchSwapLogs(fromBlock, toBlock);

  const volumeByToken = {};

  for (const log of logs) {
    const { tokenIn, amountIn } = decodeSwapLog(log);

    // Treat native ETH (address(0)) same as WETH for pricing
    const token = tokenIn === ZERO_ADDRESS ? WETH_BASE : tokenIn.toLowerCase();

    volumeByToken[token] = (volumeByToken[token] ?? BigInt(0)) + amountIn;
  }

  return volumeByToken;
}

// ─── DefiLlama export ─────────────────────────────────────────────────────────

module.exports = {
  // Metadata
  version: 1,
  methodology:
    "Volume is calculated from the amountIn field of SwapExecuted events " +
    "emitted by the FeeAggregatorMaster contract on Base.",

  [CHAIN]: {
    fetch: async (timestamp, chainBlocks) => {
      // DefiLlama passes the current day's block range
      const toBlock   = chainBlocks[CHAIN];
      const fromBlock = toBlock - 43200; // ~24 h on Base (2-s blocks)

      const volumeByToken = await getVolume(timestamp, fromBlock, toBlock);

      // Convert to the format DefiLlama expects:
      // { [chain:tokenAddress]: humanReadableAmount }
      // We return raw BigInt strings here; DefiLlama SDK handles decimals/pricing.
      const dailyVolume = {};
      for (const [token, amount] of Object.entries(volumeByToken)) {
        dailyVolume[`${CHAIN}:${token}`] = amount.toString();
      }

      return { dailyVolume, timestamp };
    },

    start: 1746316800, // 2025-05-04 (approx deploy date)
  },
};
