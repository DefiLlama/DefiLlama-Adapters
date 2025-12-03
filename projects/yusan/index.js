const { get } = require("../helper/http");

const YUSAN_API = "https://52mp3-qiaaa-aaaar-qbzja-cai.icp0.io/metrics_json";
const ONESEC_API = "https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api/balances";

// Map Yusan token symbols to CoinGecko IDs
const TOKEN_MAPPING = {
  ICP: "internet-computer",
  USDC: "usd-coin",
  USDT: "tether",
  ckBTC: "bitcoin",
};

// Parse underscore-separated numbers (e.g., "154_526_569" -> 154526569)
function parseBalance(str) {
  if (!str) return 0;
  return Number(str.replace(/_/g, ""));
}

// Calculate chain's share of Yusan TVL based on OneSec bridge proportions (EVM chains only)
function calcChainAmount(yusanSupply, bridgeData, chain) {
  const bridgeEvmTotal =
    parseBalance(bridgeData?.ethereum) +
    parseBalance(bridgeData?.arbitrum) +
    parseBalance(bridgeData?.base);

  if (bridgeEvmTotal === 0) return 0;

  const chainBalance = parseBalance(bridgeData?.[chain]);
  // chainAmount = yusanSupply * (chainBalance / bridgeEvmTotal)
  return yusanSupply * chainBalance / bridgeEvmTotal;
}

async function tvl(api) {
  const data = await get(YUSAN_API);

  for (const [symbol, market] of Object.entries(data.tokens)) {
    const cgId = TOKEN_MAPPING[symbol];
    if (cgId) {
      // All values are in e8s (8 decimals)
      api.addCGToken(cgId, market.total_supply / 1e8);
    }
  }
}

async function borrowed(api) {
  const data = await get(YUSAN_API);

  for (const [symbol, market] of Object.entries(data.tokens)) {
    const cgId = TOKEN_MAPPING[symbol];
    if (cgId && market.total_borrow > 0) {
      api.addCGToken(cgId, market.total_borrow / 1e8);
    }
  }
}

async function ckBtcTvl(api) {
  const data = await get(YUSAN_API);
  const ckBtcMarket = data.tokens.ckBTC;
  if (ckBtcMarket) {
    api.addCGToken("bitcoin", ckBtcMarket.total_supply / 1e8);
  }
}

async function ethereumTvl(api) {
  const [yusan, bridge] = await Promise.all([get(YUSAN_API), get(ONESEC_API)]);
  const usdcAmount = calcChainAmount(yusan.tokens.USDC?.total_supply || 0, bridge.USDC, "ethereum");
  const usdtAmount = calcChainAmount(yusan.tokens.USDT?.total_supply || 0, bridge.USDT, "ethereum");
  if (usdcAmount > 0) {
    api.addCGToken("usd-coin", usdcAmount / 1e8);
  }
  if (usdtAmount > 0) {
    api.addCGToken("tether", usdtAmount / 1e8);
  }
}

async function arbitrumTvl(api) {
  const [yusan, bridge] = await Promise.all([get(YUSAN_API), get(ONESEC_API)]);
  const usdcAmount = calcChainAmount(yusan.tokens.USDC?.total_supply || 0, bridge.USDC, "arbitrum");
  const usdtAmount = calcChainAmount(yusan.tokens.USDT?.total_supply || 0, bridge.USDT, "arbitrum");
  if (usdcAmount > 0) {
    api.addCGToken("usd-coin", usdcAmount / 1e8);
  }
  if (usdtAmount > 0) {
    api.addCGToken("tether", usdtAmount / 1e8);
  }
}

async function baseTvl(api) {
  const [yusan, bridge] = await Promise.all([get(YUSAN_API), get(ONESEC_API)]);
  const usdcAmount = calcChainAmount(yusan.tokens.USDC?.total_supply || 0, bridge.USDC, "base");
  const usdtAmount = calcChainAmount(yusan.tokens.USDT?.total_supply || 0, bridge.USDT, "base");
  if (usdcAmount > 0) {
    api.addCGToken("usd-coin", usdcAmount / 1e8);
  }
  if (usdtAmount > 0) {
    api.addCGToken("tether", usdtAmount / 1e8);
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    "TVL is the total supply deposited in Yusan lending markets. Borrowed shows total outstanding loans.",
  icp: {
    tvl,
    borrowed,
  },
  bitcoin: { tvl: ckBtcTvl },
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: arbitrumTvl },
  base: { tvl: baseTvl },
};
