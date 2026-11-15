const { callSoroban, getContractEvents } = require("../helper/chain/stellar");
const { getCache, setCache } = require("../helper/cache");
const methodologies = require("../helper/methodologies");

const BACKSTOP = "CAHCUKBPTW5DR5RNXOHCTJD5U76A6EEZXYZAQFRQEEQRXQ3CRUZ6Z3MO";
const POOL_FACTORY = "CAKLFWAHB2RIYRBSPUL6EH43AIQ5ILBEM7HTMWYSJRL7PHZQ676KMCV5";
const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
const XLM = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA";
const BLNT_USDC = "CDQMIKIHKA5UY3FQJ2UDTLNX3GOPD3GPNZWSPTOBVOHEUMQJQXOPC7Y3";
const BLNT_XLM = "CA5HX3D47PQZWC2E7VWXCKH4534P2NOJEOIXAWU47MI4QV2FQUYY3FLC";
const SCALAR_12 = 10n ** 12n;

// Seed the production pools because Soroban RPC event history is bounded. New
// pools are added from factory events and persisted in the DefiLlama cache.
const KNOWN_POOLS = [
  "CACSQWCMKG45TUHCQ3LXHOB7YEEJH4W376ZHQPXH2IZ3TE4NJHFZMCY7", // Fixed Pool V3
  "CAUTPSQDAJEUV5XEU3EXFVYRGDJLEJGVTFJCFZCSPTDCREAMZ573VF4D", // YieldBlent
];

async function getPools() {
  const cached = (await getCache("blnt-v3", "stellar"))?.pools ?? [];
  const pools = new Set([...KNOWN_POOLS, ...cached]);
  (await callSoroban(BACKSTOP, "reward_zone")).forEach((pool) => pools.add(pool));

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

// pool reserve custody (borrowed excluded) plus direct USDC/XLM backstop tier deposits
async function tvl(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets)
      api.add(asset, (await callSoroban(asset, "balance", [pool])).toString());
  for (const token of [USDC, XLM])
    api.add(token, (await callSoroban(token, "balance", [BACKSTOP])).toString());
}

async function borrowed(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      const { data } = await callSoroban(pool, "get_reserve", [asset]);
      api.add(asset, ((data.d_supply * data.d_rate) / SCALAR_12).toString());
    }
}

// backstop's share of each canonical Comet pool's recorded reserves, as raw tokens
async function pool2(api) {
  for (const comet of [BLNT_USDC, BLNT_XLM]) {
    const [lp, totalSupply, tokens] = await Promise.all([
      callSoroban(comet, "balance", [BACKSTOP]),
      callSoroban(comet, "get_total_supply"),
      callSoroban(comet, "get_tokens"),
    ]);
    for (const token of tokens) {
      const reserve = await callSoroban(comet, "get_balance", [token]);
      api.add(token, (reserve * lp / totalSupply).toString());
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket} TVL is the on-chain reserve-token custody of every pool deployed by the BLNT V3 factory, plus the USDC and XLM deposited directly into the shared backstop's USDC and XLM tiers. Borrowed is each reserve's outstanding debt (d_supply * d_rate). Pool2 is the backstop's proportional share of the canonical BLNT:USDC and BLNT:XLM Comet pools, counted as raw tokens. BLNT emissions held by the backstop are excluded.`,
  stellar: {
    tvl,
    borrowed,
    pool2,
  },
};
