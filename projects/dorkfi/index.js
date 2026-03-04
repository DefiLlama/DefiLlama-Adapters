const { toUSDTBalances } = require("../helper/balances");
const { lookupApplications, lookupAccountByID } = require("../helper/chain/algorand");
const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const sdk = require("@defillama/sdk");

// ─── DorkFi Contract IDs ───────────────────────────────────────────────────
// Algorand Mainnet
const ALGO_POOL_APP_ID    = 3207735602;  // Main lending pool
const ALGO_MARKET_APP_ID  = 3207744109;  // ALGO wrapper/market contract
const ALGO_POOL_ADDRESS   = "F4JIZCKWQFAYYCO2LCSP3GJ6WYXZSMYQJI4BOR5KWHRWIOGBEX56DG7HGY";

// Voi Network (AVM-compatible, separate RPC)
const VOI_POOL_1_APP_ID   = 41760711;
const VOI_POOL_2_APP_ID   = 44866061;
const VOI_POOL_1_ADDRESS  = "WJL4HAFE5OJ55VJU5OY4CMY2VH5RURLKHEP3HNRQ2Z7TI6GB5BWTKGYIXY";
const VOI_POOL_2_ADDRESS  = "USFLG43ES6NG473BFYJJRAHAE3BA42YXXA3SE73YVUHFAKTWJYMVKRUZHA";

const VOI_RPC = "https://mainnet-api.voi.nodely.dev";

// ─── Helpers ───────────────────────────────────────────────────────────────
const axios = require("axios");

const voiAxios = axios.create({
  baseURL: VOI_RPC,
  timeout: 30000,
});

async function getVoiAccountBalance(address) {
  const resp = await voiAxios.get(`/v2/accounts/${address}`);
  const acct = resp.data;
  // Deposited = balance - min_balance (min_balance covers box/app storage)
  const deposited = Math.max(0, acct.amount - acct["min-balance"]);
  return deposited; // in microVOI
}

async function getAlgoAccountBalance(address) {
  const acct = await lookupAccountByID(address);
  const deposited = Math.max(0, acct.account.amount - acct.account["min-balance"]);
  return deposited; // in microALGO
}

// ─── TVL Functions ─────────────────────────────────────────────────────────

/**
 * Algorand TVL: ALGO deposited in the lending pool
 */
async function algorandTvl(_, _1, _2, { api }) {
  const deposited = await getAlgoAccountBalance(ALGO_POOL_ADDRESS);
  // ALGO = asset ID 0 in Algorand coreAssets
  api.add("coingecko:algorand", deposited / 1e6);
}

/**
 * Voi Network TVL: VOI deposited across both lending pools
 * Voi is not yet on DefiLlama chain list — track as "other" for now
 * Will be updated when Voi is added to supported chains
 */
async function voiTvl() {
  const [pool1, pool2] = await Promise.all([
    getVoiAccountBalance(VOI_POOL_1_ADDRESS),
    getVoiAccountBalance(VOI_POOL_2_ADDRESS),
  ]);
  const totalVoi = (pool1 + pool2) / 1e6;
  // Use VOI CoinGecko ID when available
  return toUSDTBalances(totalVoi * 0); // placeholder until Voi has CoinGecko listing
}

// ─── Borrowed (outstanding loans) ─────────────────────────────────────────
// DorkFi tracks borrowed amounts in the market contracts via global state.
// For now we report TVL only (deposits); borrowed tracking added in v2.

// ─── Exports ──────────────────────────────────────────────────────────────
module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL is the total ALGO (Algorand) and VOI (Voi Network) deposited into DorkFi's " +
    "lending pools as collateral. Borrowed amounts are not subtracted from TVL.",
  algorand: {
    tvl: algorandTvl,
  },
  // Voi Network support added once DefiLlama adds Voi chain
  // voi: { tvl: voiTvl },
};
