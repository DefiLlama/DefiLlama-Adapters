/* SOLID Protocol (Terra, phoenix-1) — Collateral-only TVL adapter
 * - Counts only collateral balances in SOLID vaults
 * - ampLUNA priced via Eris exchange_rate with $3k min-effective filter
 * - bLUNA priced via weighted-average of Astroport & White Whale pools
 *   (each pool must pass a min-liquidity filter in LUNA USD terms)
 */

const axios = require("axios");
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");

// ------- Config -------
const LCD = "https://terra-api.cosmosrescue.dev:8443";   // Terra LCD (community endpoint)

/** Thresholds */
const AMP_MIN_USD   = 3000;  // ampLUNA: min effective USD to include
const BLUNA_MIN_USD = 3000;  // per-pool min (based on LUNA-side reserve * LUNA USD)

// ------- Addresses -------
const ADDR = {
  ampLUNA: {
    token:   "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct",
    custody: "terra18uxq2k6wpsqythpakz5n6ljnuzyehrt775zkdclrtdtv6da63gmskqn7dq",
  },
  bLUNA: {
    token:   "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml",
    custody: "terra1fyfrqdf58nf4fev2amrdrytq5d63njulfa7sm75c0zu4pnr693dsqlr7p9",
    // bLUNA–LUNA pairs used for weighted price (by LUNA reserve)
    pairs: [
      "terra1h32epkd72x7st0wk49z35qlpsxf26pw4ydacs8acq6uka7hgshmq7z7vl9", // Astroport
      "terra1j5znhs9jeyty9u9jcagl3vefkvzwqp6u9tq9a3e5qrz4gmj2udyqp0z0xc", // White Whale
    ],
  },
  USDC: {
    token:   "ibc/2C962DAB9F57FE0921435426AE75196009FAA1981BF86991203C8411F8980FDB",
    custody: "terra1hdu4t2mrrv98rwdzps40va7me3xjme32upcw36x4cda8tx9cee9qrwdhsl",
  },
  wETH: {
    token:   "ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674",
    custody: "terra1xyxxg9z8eep6xkfts4sp7gper677glz0md4wd9krj4d8dllmut8q8tjjrl",
  },
  wBTC: {
    token:   "ibc/05D299885B07905B6886F554B39346EA6761246076A1120B1950049B92B922DD",
    custody: "terra1jksfmpavp09wwla8xffera3q7z49ef6r2jx9lu29mwvl64g34ljs7u2hln",
  },
  wSOL: {
    token:   "terra1ctelwayk6t2zu30a8v9kdg3u2gr0slpjdfny5pjp7m3tuquk32ysugyjdg",
    custody: "terra1e32q545j90agakl32mtkacq05990cnr54czj8wp0wv3nttkrhwlqr9spf5",
  },
  wBNB: {
    token:   "terra1xc7ynquupyfcn43sye5pfmnlzjcw2ck9keh0l2w2a4rhjnkp64uq4pr388",
    custody: "terra1fluajm00hwu9wyy8yuyf4zag7x5pw95vdlgkhh8w03pfzqj6hapsx4673t",
  },
};

// ------- Helpers -------
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64");

async function smartQuery(contract, msg) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart?query_msg=${b64(msg)}`;
  const { data } = await axios.get(url);
  return data.data || data;
}

async function bankBalances(address) {
  const url = `${LCD}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  const { data } = await axios.get(url);
  return data.balances || [];
}

async function cw20Balance(token, address) {
  const r = await smartQuery(token, { balance: { address } });
  return BigInt(r.balance || "0");
}

async function cw20Decimals(token) {
  const r = await smartQuery(token, { token_info: {} });
  return r.decimals ?? r.token_info?.decimals ?? 6;
}

// LUNA USD price
async function getLunaUsd() {
  try {
    const { data } = await axios.get("https://coins.llama.fi/prices/current/coingecko:terra-luna-2");
    return data?.coins?.["coingecko:terra-luna-2"]?.price ?? 0;
  } catch {
    return 0;
  }
}

// ampLUNA exchange rate from Eris API
async function getAmpLunaRate() {
  try {
    const { data } = await axios.get("https://api.erisprotocol.com/terra/amplifier/LUNA");
    const rate = Number(data?.exchange_rate);
    return rate > 0 ? rate : 1;
  } catch {
    return 1;
  }
}

// bLUNA rate (weighted avg)
async function getBLunaRateWeighted(lunaUsd) {
  const bluna = ADDR.bLUNA.token;
  let totalWeighted = 0;
  let totalWeight   = 0;

  for (const pair of ADDR.bLUNA.pairs) {
    try {
      const pool = await smartQuery(pair, { pool: {} });
      const assets = pool.assets || [];
      if (assets.length !== 2) continue;

      let lunaRes = 0, blunaRes = 0;
      for (const a of assets) {
        if (a.info?.native_token?.denom === "uluna") lunaRes = Number(a.amount) / 1e6;
        if (a.info?.token?.contract_addr === bluna) blunaRes = Number(a.amount) / 1e6;
      }
      if (lunaRes <= 0 || blunaRes <= 0) continue;

      if (lunaUsd * lunaRes < BLUNA_MIN_USD) continue;

      const rate = lunaRes / blunaRes;
      totalWeighted += rate * lunaRes;
      totalWeight   += lunaRes;
    } catch {}
  }

  if (totalWeight === 0) return 1;
  return totalWeighted / totalWeight;
}

// ------- TVL -------
async function tvl() {
  const balances = {};
  const lunaUsd = await getLunaUsd();

  const [ampRate, bRate] = await Promise.all([
    getAmpLunaRate(),
    getBLunaRateWeighted(lunaUsd),
  ]);

  // ampLUNA
  {
    const [bal, dec] = await Promise.all([
      cw20Balance(ADDR.ampLUNA.token, ADDR.ampLUNA.custody),
      cw20Decimals(ADDR.ampLUNA.token),
    ]);
    const amt    = Number(bal) / 10 ** dec;
    const lunaEq = amt * ampRate;
    const usdVal = lunaEq * lunaUsd;
    if (usdVal >= AMP_MIN_USD) {
      sumSingleBalance(balances, "uluna", lunaEq);
    }
  }

  // bLUNA
  {
    const [bal, dec] = await Promise.all([
      cw20Balance(ADDR.bLUNA.token, ADDR.bLUNA.custody),
      cw20Decimals(ADDR.bLUNA.token),
    ]);
    const amt    = Number(bal) / 10 ** dec;
    const lunaEq = amt * bRate;
    if (lunaEq > 0) sumSingleBalance(balances, "uluna", lunaEq);
  }

  // IBC tokens
  for (const k of ["USDC", "wETH", "wBTC"]) {
    const { token: denom, custody } = ADDR[k];
    const list = await bankBalances(custody);
    const coin = list.find((c) => c.denom === denom);
    const amt  = coin ? Number(coin.amount) / 1e6 : 0;
    if (amt > 0) sumSingleBalance(balances, denom, amt);
  }

  // Wormhole cw20
  for (const k of ["wSOL", "wBNB"]) {
    const { token, custody } = ADDR[k];
    const [bal, dec] = await Promise.all([cw20Balance(token, custody), cw20Decimals(token)]);
    const amt = Number(bal) / 10 ** dec;
    if (amt > 0) sumSingleBalance(balances, token, amt);
  }

  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL = sum of SOLID collateral vault balances (ampLUNA, bLUNA, USDC (Noble IBC), wETH.axl, wBTC.axl, wSOL.wh, wBNB.wh). ampLUNA uses Eris exchange_rate with a $3k min-effective filter. bLUNA uses a liquidity-weighted average rate from Astroport & White Whale bLUNA–LUNA pools, each required to pass a $3k min-liquidity filter. Balances are read from custody contracts on Terra (phoenix-1).",
  terra: { tvl },
};
