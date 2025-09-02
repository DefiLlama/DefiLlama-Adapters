const axios = require("axios");

const GALA_GATEWAY = "https://gateway-mainnet.galachain.com";
const COINGECKO_PRICE = "https://api.coingecko.com/api/v3/simple/price";

async function getCoingeckoPrices(symbols = ["gala"]) {
  try {
    const { data } = await axios.get(COINGECKO_PRICE, {
      params: {
        ids: symbols.join(","),
        vs_currencies: "usd",
      },
    });
    return data;
  } catch (e) {
    console.error("Coingecko price fetch failed:", e.message);
    return {};
  }
}

async function getGalaTokens() {
  const { data } = await axios.get(`${GALA_GATEWAY}/dex/tokens`);
  return data.tokens || [];
}

async function getGalaPrice(symbol) {
  const tokens = await getGalaTokens();
  const token = tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
  if (token && token.priceUSD) {
    return token.priceUSD;
  }
  return null;
}

async function getPools() {
  // ⚠️ Replace with actual Gala endpoint for pools
  const { data } = await axios.get(`${GALA_GATEWAY}/dex/pools`);
  return data.pools || [];
}

async function tvl() {
  const pools = await getPools();
  const symbols = new Set();

  pools.forEach((p) => {
    symbols.add(p.tokenA.symbol.toLowerCase());
    symbols.add(p.tokenB.symbol.toLowerCase());
  });

  const coingeckoPrices = await getCoingeckoPrices([...symbols]);

  let totalUsd = 0;

  for (const pool of pools) {
    for (const token of [pool.tokenA, pool.tokenB]) {
      const symbol = token.symbol.toLowerCase();
      const amount = Number(token.amount) / 10 ** token.decimals;

      let priceUsd =
        coingeckoPrices[symbol]?.usd ||
        (await getGalaPrice(symbol)) ||
        0;

      totalUsd += amount * priceUsd;
    }
  }

  return { usd: totalUsd };
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is calculated by fetching liquidity pools from GalaSwap via Gala Gateway API. Token prices are resolved from CoinGecko, with a fallback to Gala API for tokens not listed on CoinGecko.",
  gala: {
    tvl,
  },
};
