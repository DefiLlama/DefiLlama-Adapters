const { callSoroban } = require("../helper/chain/stellar");
const { getConfig } = require("../helper/cache");
const methodologies = require("../helper/methodologies");

// Templar's deployment registry for Precept: every contract it deployed on
// mainnet, one JSON object per line. New pools are added by the pool-deploy
// workflow, so they are counted without changes here.
const REGISTRY_URL = "https://raw.githubusercontent.com/Templar-Protocol/precept/main/registry/mainnet.jsonl";
const SCALAR_12 = 10n ** 12n; // d_rate fixed-point scalar, as in Blend v2
const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

// Reserve tokens with no DefiLlama price, counted as another token instead.
// earnUSDC (Gami Labs, 13 decimals) is a USDC vault share: count it 1:1 as
// USDC (7 decimals). That slightly undercounts it, since a share redeems for
// a little more than 1 USDC.
const PRICED_AS = {
  CCL3WITWFFXIHV2I52ECV5DPIEOFSTU3PBPR53ILPLF2IP5KHECXRUTY: { token: USDC, divisor: 10n ** 6n },
};

function add(api, asset, amount) {
  const as = PRICED_AS[asset];
  if (as) api.add(as.token, (BigInt(amount) / as.divisor).toString());
  else api.add(asset, amount.toString());
}

// Every registered pool, retired ones included: "retired" is a registry label,
// the pool still holds funds its depositors can withdraw.
async function getPools() {
  const registry = await getConfig("templar-precept", REGISTRY_URL);
  if (typeof registry !== "string") throw new Error("templar-precept: registry unavailable and no cached copy");
  const pools = registry.trim().split("\n").map((line) => JSON.parse(line))
    .filter((r) => r.kind === "contract" && r.network === "mainnet" && r.role === "pool")
    .map((r) => r.id);
  if (!pools.length) throw new Error("templar-precept: no pools in the registry");
  return pools;
}

let _poolAssets;
// [{ pool, assets: [address] }] for every pool; a failure is not kept, so the next run reads again
async function getPoolAssets() {
  if (!_poolAssets) _poolAssets = (async () => {
    const out = [];
    for (const pool of await getPools())
      out.push({ pool, assets: await callSoroban(pool, "get_reserve_list") });
    return out;
  })().catch((e) => {
    _poolAssets = undefined;
    throw e;
  });
  return _poolAssets;
}

// tvl: actual token balances held by each pool contract. No read is skipped:
// a failed run is better than one that under-reports.
async function tvl(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets)
      add(api, asset, await callSoroban(asset, "balance", [pool]));
}

// borrowed: outstanding debt from each reserve's accounting (d_supply * d_rate)
async function borrowed(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      const { data } = await callSoroban(pool, "get_reserve", [asset]);
      add(api, asset, (data.d_supply * data.d_rate) / SCALAR_12);
    }
}

module.exports = {
  timetravel: false,
  start: "2026-10-27",
  methodology: `${methodologies.lendingMarket}. TVL is the on-chain token balances held by every Precept pool in the Templar deployment registry; borrowed is each reserve's outstanding debt (d_supply * d_rate).`,
  stellar: {
    tvl, borrowed,
  },
};
