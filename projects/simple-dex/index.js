const { getTableRows, getTokenPriceUsd } = require("../helper/chain/proton");
const { toUSDTBalances } = require("../helper/balances");

const DEX_CONTRACT = "simpledex";

// Known stablecoin prices (USD)
const STABLECOINS = {
  "XUSDC:xtokens": 1.0,
  "XMD:xmd.token": 1.0,
  "XUSDT:xtokens": 1.0,
};

function parseSymbol(symStr) {
  const [precision, symbol] = symStr.split(",");
  return { precision: parseInt(precision), symbol };
}

function toDecimal(amount, precision) {
  return Number(amount) / Math.pow(10, precision);
}

async function getAllPools() {
  let allRows = [];
  let lower_bound = "";
  let more = true;

  while (more) {
    const result = await getTableRows({
      code: DEX_CONTRACT,
      scope: DEX_CONTRACT,
      table: "pools",
      limit: 100,
      lower_bound,
    });
    allRows = allRows.concat(result.rows);
    more = result.more;
    if (more) lower_bound = result.next_key;
  }

  return allRows;
}

function getTokenKey(contract, symbol) {
  return `${symbol}:${contract}`;
}

async function tvl() {
  const [pools, xprPrice] = await Promise.all([
    getAllPools(),
    getTokenPriceUsd("XPR", "eosio.token"),
  ]);

  let totalTvl = 0;

  for (const pool of pools) {
    if (pool.paused) continue;

    const tokenA = parseSymbol(pool.tokenASymbol);
    const tokenB = parseSymbol(pool.tokenBSymbol);
    const reserveA = toDecimal(pool.reserveA, tokenA.precision);
    const reserveB = toDecimal(pool.reserveB, tokenB.precision);

    const keyA = getTokenKey(pool.tokenAContract, tokenA.symbol);
    const keyB = getTokenKey(pool.tokenBContract, tokenB.symbol);

    const isXprA = keyA === "XPR:eosio.token";
    const isXprB = keyB === "XPR:eosio.token";
    const priceA = isXprA ? xprPrice : STABLECOINS[keyA] || null;
    const priceB = isXprB ? xprPrice : STABLECOINS[keyB] || null;

    if (priceA !== null && priceB !== null) {
      // Both sides have known prices
      totalTvl += reserveA * priceA + reserveB * priceB;
    } else if (priceA !== null) {
      // Only side A has a known price — double it (AMM equal value)
      totalTvl += 2 * reserveA * priceA;
    } else if (priceB !== null) {
      // Only side B has a known price — double it
      totalTvl += 2 * reserveB * priceB;
    }
  }

  return toUSDTBalances(totalTvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "SimpleDEX TVL is the sum of all liquidity pool reserves. XPR-paired pools use the XPR price doubled (AMM equal-value invariant). Stablecoin pools are priced at face value.",
  proton: {
    tvl,
  },
};
