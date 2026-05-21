/**
 * DeFiLlama adapter for PRED — TOTAL TVL (single chart).
 *
 * TVL = USDC.balanceOf(WrappedCollateral)
 *     + USDC.balanceOf(NegRiskVault)
 *     + Σ USDC.balanceOf(w) for every user trading wallet w
 *
 * User wallets: any address that sent/received USDC with PRED trade endpoints
 * (USDC.Transfer log scan — includes Safe + ProxyWallet clones).
 *
 * Copy to projects/pred/index.js in DefiLlama-Adapters when submitting.
 */

const { getLogs } = require("../helper/cache/getLogs");

const BASE_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const TRANSFER_ABI =
  "event Transfer(address indexed from, address indexed to, uint256 value)";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const PROTOCOL_CONTRACTS = [
  "0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c", // wrappedCollateral
  "0x3aa5a591f79ae2a9790b7335fab875bb0625a5bc", // negRiskVault
];

const TRADE_ENDPOINTS = [
  "0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c",
  "0x6b64b468bbd5a9166347bf47015763cfe8ff5d82",
  "0x1938af63b717b80ea62ccb4ccbf799f8a28defb0",
  "0xc574a05e622a769e6ab14293070cdf6cadb55f98",
  "0xb0a1306a6bced14f00dacfae3043f173f72e126c",
  "0x3aa5a591f79ae2a9790b7335fab875bb0625a5bc",
];

const RESERVED = new Set(
  [
    BASE_USDC,
    "0xc83c5cca746d213d9cf63fe668e7eb8dee35314b",
    "0x6b64b468bbd5a9166347bf47015763cfe8ff5d82",
    "0x1938af63b717b80ea62ccb4ccbf799f8a28defb0",
    "0x6bca0aad6096ea7ecba93b5efcf8ebd58dd9cdad",
    "0xc574a05e622a769e6ab14293070cdf6cadb55f98",
    "0xb0a1306a6bced14f00dacfae3043f173f72e126c",
    "0x3aa5a591f79ae2a9790b7335fab875bb0625a5bc",
    "0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c",
    "0x6c0f43d5f6355b0500e0cbc368fb25e3a7825e06",
    "0xfb425b95b5b3a4fb96cd036f47ca1774c7063f52",
    "0xa077e7aabf2e3c0155f83789e95f46602d03f7f0",
    "0x0000000000000000000000000000000000000000",
    ...TRADE_ENDPOINTS,
    ...PROTOCOL_CONTRACTS,
  ].map((a) => a.toLowerCase()),
);

const WALLET_DISCOVERY_FROM_BLOCK = 45890000;

function topicAddress(addr) {
  return "0x" + addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

// Unique padded topics for eth_getLogs OR filter (dedupe shared addresses e.g. vault/wcol).
const ENDPOINT_TOPICS = [
  ...new Set(TRADE_ENDPOINTS.map((a) => topicAddress(a))),
];

function addWallet(wallets, addr) {
  if (!addr) return;
  const lower = String(addr).toLowerCase();
  if (!lower.startsWith("0x") || lower.length !== 42) return;
  if (RESERVED.has(lower)) return;
  wallets.add(lower);
}

async function discoverUserWallets(api) {
  const wallets = new Set();
  const logOpts = {
    api,
    target: BASE_USDC,
    eventAbi: TRANSFER_ABI,
    onlyArgs: true,
    fromBlock: WALLET_DISCOVERY_FROM_BLOCK,
  };

  const [deposits, withdrawals] = await Promise.all([
    getLogs({
      ...logOpts,
      extraKey: "pred-user-deposits",
      topics: [TRANSFER_TOPIC, null, ENDPOINT_TOPICS],
    }),
    getLogs({
      ...logOpts,
      extraKey: "pred-user-withdrawals",
      topics: [TRANSFER_TOPIC, ENDPOINT_TOPICS, null],
    }),
  ]);

  for (const log of deposits) {
    addWallet(wallets, log.from);
  }
  for (const log of withdrawals) {
    addWallet(wallets, log.to);
  }

  return [...wallets];
}

async function tvl(api) {
  const userWallets = await discoverUserWallets(api);
  const owners = [...PROTOCOL_CONTRACTS, ...userWallets];

  await api.sumTokens({
    owners,
    tokens: [BASE_USDC],
  });
  return api.getBalances();
}

module.exports = {
  methodology:
    "Total TVL = USDC in WrappedCollateral + USDC in NegRiskVault + USDC in all user trading wallets that have interacted with PRED protocol contracts (discovered via USDC transfer logs).",
  start: 1778583703,
  base: { tvl },
};
