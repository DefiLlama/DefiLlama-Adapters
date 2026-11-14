const { callSoroban, getContractEvents } = require("../helper/chain/stellar");
const { getCache, setCache } = require("../helper/cache");
const methodologies = require("../helper/methodologies");

const BACKSTOP = "CAHCUKBPTW5DR5RNXOHCTJD5U76A6EEZXYZAQFRQEEQRXQ3CRUZ6Z3MO";
const POOL_FACTORY = "CAKLFWAHB2RIYRBSPUL6EH43AIQ5ILBEM7HTMWYSJRL7PHZQ676KMCV5";
const BLNT = "CCBNWP5L7ZSXA3DBWCMFAVKFVRW3ZHWO7B5J557W42O64DDZNPJP7VDS";
const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
const XLM = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA";
const BLNT_USDC = "CDQMIKIHKA5UY3FQJ2UDTLNX3GOPD3GPNZWSPTOBVOHEUMQJQXOPC7Y3";
const BLNT_XLM = "CA5HX3D47PQZWC2E7VWXCKH4534P2NOJEOIXAWU47MI4QV2FQUYY3FLC";
const SCALAR_12 = 10n ** 12n;
const BLNT_TO_PAIR_WEIGHT_RATIO = 4n; // canonical Comet pools are 80% BLNT / 20% paired asset

// Seed the production pools because Soroban RPC event history is bounded. New
// pools are added from factory events and persisted in the DefiLlama cache.
const KNOWN_POOLS = [
  "CACSQWCMKG45TUHCQ3LXHOB7YEEJH4W376ZHQPXH2IZ3TE4NJHFZMCY7", // Fixed Pool V3
  "CAUTPSQDAJEUV5XEU3EXFVYRGDJLEJGVTFJCFZCSPTDCREAMZ573VF4D", // YieldBlent
];

async function getPools() {
  const cached = (await getCache("blnt-v3", "stellar"))?.pools ?? [];
  const pools = new Set([...KNOWN_POOLS, ...cached]);

  try {
    const rewardZone = await callSoroban(BACKSTOP, "reward_zone");
    rewardZone.forEach((pool) => pools.add(pool));
  } catch (e) {
    console.log("blnt-v3: reward_zone failed, using known and cached pools:", e.message);
  }

  try {
    const events = await getContractEvents({ contractId: POOL_FACTORY, topic: "deploy" });
    events.forEach(({ data }) => pools.add(data));
  } catch (e) {
    console.log("blnt-v3: factory event discovery failed, using known and cached pools:", e.message);
  }

  const next = [...pools].sort();
  if (JSON.stringify(next) !== JSON.stringify([...cached].sort()))
    await setCache("blnt-v3", "stellar", { pools: next });
  return next;
}

let poolAssets;
async function getPoolAssets() {
  if (!poolAssets) poolAssets = (async () => {
    const out = [];
    for (const pool of await getPools())
      out.push({ pool, assets: await callSoroban(pool, "get_reserve_list") });
    return out;
  })();
  return poolAssets;
}

// Actual reserve-token custody is lending TVL; borrowed tokens are excluded.
async function tvl(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets)
      api.add(asset, (await callSoroban(asset, "balance", [pool])).toString());
}

async function borrowed(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      const { data } = await callSoroban(pool, "get_reserve", [asset]);
      api.add(asset, ((data.d_supply * data.d_rate) / SCALAR_12).toString());
    }
}

async function getCometState(comet, pair) {
  const [lpBalance, totalSupply, tokens] = await Promise.all([
    callSoroban(comet, "balance", [BACKSTOP]),
    callSoroban(comet, "get_total_supply"),
    callSoroban(comet, "get_tokens"),
  ]);
  if (totalSupply <= 0n || tokens.length !== 2 || !tokens.includes(BLNT) || !tokens.includes(pair))
    throw new Error(`Unexpected canonical Comet configuration: ${comet}`);

  const [blntReserve, pairReserve] = await Promise.all([
    callSoroban(comet, "get_balance", [BLNT]),
    callSoroban(comet, "get_balance", [pair]),
  ]);
  return { lpBalance, totalSupply, blntReserve, pairReserve };
}

// DefiLlama does not currently price BLNT. Represent the backstop's BLNT
// exposure in USDC using the canonical BLNT:USDC 80/20 Comet marginal price.
// The paired USDC and XLM exposure remains denominated in its actual asset,
// and direct USDC- and XLM-tier custody is included at face value.
async function pool2(api) {
  const [anchor, xlmPool, directUsdc, directXlm] = await Promise.all([
    getCometState(BLNT_USDC, USDC),
    getCometState(BLNT_XLM, XLM),
    callSoroban(USDC, "balance", [BACKSTOP]),
    callSoroban(XLM, "balance", [BACKSTOP]),
  ]);
  if (anchor.blntReserve <= 0n)
    throw new Error("Canonical BLNT:USDC Comet pool has no BLNT reserve");

  const anchorUsdcShare = anchor.pairReserve * anchor.lpBalance / anchor.totalSupply;
  const anchorValueUsdc = anchorUsdcShare * (BLNT_TO_PAIR_WEIGHT_RATIO + 1n);

  const xlmShare = xlmPool.pairReserve * xlmPool.lpBalance / xlmPool.totalSupply;
  const xlmPoolBlntShare = xlmPool.blntReserve * xlmPool.lpBalance / xlmPool.totalSupply;
  const xlmPoolBlntValueUsdc = xlmPoolBlntShare
    * BLNT_TO_PAIR_WEIGHT_RATIO
    * anchor.pairReserve
    / anchor.blntReserve;

  api.add(USDC, (anchorValueUsdc + xlmPoolBlntValueUsdc + directUsdc).toString());
  api.add(XLM, (xlmShare + directXlm).toString());
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `${methodologies.lendingMarket} TVL is the on-chain reserve-token custody of every pool deployed by the BLNT V3 factory; borrowed is each reserve's outstanding debt (d_supply * d_rate). Pool2 includes the backstop's proportional holdings in both canonical BLNT Comet pools and its direct USDC- and XLM-tier custody. Because BLNT is not priced by DefiLlama, its pool2 value is represented in USDC using the canonical BLNT:USDC 80/20 pool's on-chain marginal price. Raw BLNT emissions held by the backstop are excluded.`,
  stellar: {
    tvl,
    borrowed,
    pool2,
  },
};
