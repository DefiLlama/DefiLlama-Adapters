const { get } = require("../helper/http");

const API_URL = "https://hbd6l-tyaaa-aaaaj-a2ixq-cai.icp0.io/metrics_json";

// Map Yusan token symbols to CoinGecko IDs
const TOKEN_MAPPING = {
  ICP: "internet-computer",
  USDC: "usd-coin",
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

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the total supply deposited in Yusan lending markets. Borrowed shows total outstanding loans.",
  icp: {
    tvl,
    borrowed,
  },
};
