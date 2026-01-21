/**
 * PagCrypto - Volume adapter (TTV proxy, on-chain)
 *
 * - No TVL
 * - No external fetch
 * - Uses stablecoin inflows (USDC/USDT) into PagCrypto receiver wallet as daily USD volume proxy
 */

const sdk = require("@defillama/sdk");
const config = require("./config");

// ERC20 Transfer(address indexed from, address indexed to, uint256 value)
const TRANSFER_TOPIC =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function dayBounds(timestamp) {
  const dayStart = Math.floor(Number(timestamp) / 86400) * 86400;
  const dayEnd = dayStart + 86400 - 1;
  return { dayStart, dayEnd };
}

function padTopicAddress(addr) {
  const a = addr.toLowerCase().replace(/^0x/, "");
  return "0x" + a.padStart(64, "0");
}

async function getBlockAtTimestamp(chain, ts) {
  // lookupBlock exists in @defillama/sdk in most adapters contexts
  // fallback: if it ever breaks, you can replace with repo helper.
  return sdk.api.util.lookupBlock(ts, { chain });
}

async function sumStablecoinInflowsUSD({ chain, timestamp }) {
  const chainCfg = config.chains?.[chain];
  if (!chainCfg || chainCfg.status !== "active") return "0";

  const wallet = config.receiver.evm;
  const tokens = config.stablecoins?.[chain] || [];
  if (!tokens.length) return "0";

  const { dayStart, dayEnd } = dayBounds(timestamp);

  const fromBlock = await getBlockAtTimestamp(chain, dayStart);
  const toBlock = await getBlockAtTimestamp(chain, dayEnd);

  const toTopic = padTopicAddress(wallet);

  let total = 0;

  for (const token of tokens) {
    const logsResp = await sdk.api.util.getLogs({
      chain,
      target: token,
      topic: TRANSFER_TOPIC,
      fromBlock,
      toBlock,
      topics: [TRANSFER_TOPIC, null, toTopic],
    });

    const logs = logsResp?.output || logsResp || [];
    if (!Array.isArray(logs) || logs.length === 0) continue;

    // sum raw values (uint256 in data)
    let rawSum = 0n;
    for (const l of logs) {
      // sdk returns { data: "0x..." } in most cases
      const hex = l?.data;
      if (!hex || typeof hex !== "string") continue;
      rawSum += BigInt(hex);
    }
    if (rawSum === 0n) continue;

    const decimalsResp = await sdk.api.erc20.decimals(token, chain);
    const decimals = Number(decimalsResp?.output ?? 6);

    const amount = Number(rawSum) / 10 ** decimals;

    // Stablecoins treated as USD ~= amount
    total += amount;
  }

  return total.toFixed(2);
}

// Build per-chain fetcher in the expected “volume adapter” shape
function makeFetch(chain) {
  return async (timestamp) => {
    const dailyVolume = await sumStablecoinInflowsUSD({ chain, timestamp });
    return { dailyVolume };
  };
}

module.exports = {
  // If your repo requires it, you can add: timetravel: true/false
  // timetravel: true,

  ethereum: { fetch: makeFetch("ethereum"), start: async () => 0 },
  polygon: { fetch: makeFetch("polygon"), start: async () => 0 },
  base: { fetch: makeFetch("base"), start: async () => 0 },
  arbitrum: { fetch: makeFetch("arbitrum"), start: async () => 0 },
  optimism: { fetch: makeFetch("optimism"), start: async () => 0 },
};
