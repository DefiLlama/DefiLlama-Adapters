const { get } = require("../helper/http");

const API_URL = "https://52mp3-qiaaa-aaaar-qbzja-cai.icp0.io/metrics_json";

// Map Yusan token symbols to CoinGecko IDs
const TOKEN_MAPPING = {
  ICP: "internet-computer",
  USDC: "usd-coin",
  USDT: "tether",
  ckBTC: "bitcoin",
};

async function tvl(api) {
  const data = await get(API_URL);

  for (const [symbol, market] of Object.entries(data.tokens)) {
    const cgId = TOKEN_MAPPING[symbol];
    if (cgId) {
      // All values are in e8s (8 decimals)
      api.addCGToken(cgId, market.total_supply / 1e8);
    }
  }
}

async function borrowed(api) {
  const data = await get(API_URL);

  for (const [symbol, market] of Object.entries(data.tokens)) {
    const cgId = TOKEN_MAPPING[symbol];
    if (cgId && market.total_borrow > 0) {
      api.addCGToken(cgId, market.total_borrow / 1e8);
    }
  }
}

async function ckBtcTvl(api) {
  const data = await get(API_URL);
  const ckBtcMarket = data.tokens.ckBTC;
  if (ckBtcMarket) {
    api.addCGToken("bitcoin", ckBtcMarket.total_supply / 1e8);
  }
}

async function ethereumTvl(api) {
  // TODO: fetch from chain-specific endpoint
  const data = await get(API_URL);
  const usdcMarket = data.tokens.USDC;
  const usdtMarket = data.tokens.USDT;
  if (usdcMarket) {
    api.addCGToken("usd-coin", usdcMarket.total_supply / 1e8);
  }
  if (usdtMarket) {
    api.addCGToken("tether", usdtMarket.total_supply / 1e8);
  }
}

async function arbitrumTvl(api) {
  // TODO: fetch from chain-specific endpoint
  const data = await get(API_URL);
  const usdcMarket = data.tokens.USDC;
  const usdtMarket = data.tokens.USDT;
  if (usdcMarket) {
    api.addCGToken("usd-coin", usdcMarket.total_supply / 1e8);
  }
  if (usdtMarket) {
    api.addCGToken("tether", usdtMarket.total_supply / 1e8);
  }
}

async function baseTvl(api) {
  // TODO: fetch from chain-specific endpoint
  const data = await get(API_URL);
  const usdcMarket = data.tokens.USDC;
  const usdtMarket = data.tokens.USDT;
  if (usdcMarket) {
    api.addCGToken("usd-coin", usdcMarket.total_supply / 1e8);
  }
  if (usdtMarket) {
    api.addCGToken("tether", usdtMarket.total_supply / 1e8);
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
