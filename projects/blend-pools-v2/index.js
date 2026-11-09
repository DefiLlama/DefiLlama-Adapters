const { callSoroban, getContractEvents } = require("../helper/chain/stellar");
const { getCache, setCache } = require("../helper/cache");
const methodologies = require("../helper/methodologies");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";
const POOL_FACTORY_V2 = "CDSYOAVXFY7SM5S64IZPPPYB4GVGGLMQVFREPSQQEZVIWXX5R23G4QSU";
const SCALAR_12 = 10n ** 12n; // v2 b_rate/d_rate fixed-point scalar

// All pools deployed by the v2 pool factory ('deploy' events), plus whatever is
// currently in the backstop reward zone (can be empty - pools get rotated out,
// so it alone is not a reliable enumeration source). The Soroban RPC only keeps
// ~7 days of events, so the list is persisted in the llama cache and only ever
// grows; each run merges in the deploys the RPC still has.
async function getPools() {
  const pools = new Set(await callSoroban(BACKSTOP_ID, "reward_zone"));
  const cached = (await getCache("blend-pools-v2", "stellar"))?.pools ?? [];
  cached.forEach((p) => pools.add(p));

  try {
    const events = await getContractEvents({ contractId: POOL_FACTORY_V2, topic: "deploy" });
    events.forEach(({ data }) => pools.add(data));
    if (pools.size > cached.length) await setCache("blend-pools-v2", "stellar", { pools: [...pools] });
  } catch (e) {
    if (!cached.length) throw e;
    console.log("blend-pools-v2: getEvents failed, using cached pool list:", e.message);
  }
  return [...pools];
}

let _poolAssets;
// [{ pool, assets: [address] }] for every v2 pool
async function getPoolAssets() {
  if (!_poolAssets) _poolAssets = (async () => {
    const out = [];
    for (const pool of await getPools())
      out.push({ pool, assets: await callSoroban(pool, "get_reserve_list") });
    return out;
  })();
  return _poolAssets;
}

// tvl: actual token balances held by each pool contract
async function tvl(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      try {
        api.add(asset, (await callSoroban(asset, "balance", [pool])).toString());
      } catch (e) {
        // some pools list broken/non-token reserve assets (e.g. an oracle
        // contract with no balance()) - unpriceable anyway, skip them
      }
    }
}

// borrowed: outstanding debt from each reserve's accounting (d_supply * d_rate)
async function borrowed(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      const { data } = await callSoroban(pool, "get_reserve", [asset]);
      api.add(asset, ((data.d_supply * data.d_rate) / SCALAR_12).toString());
    }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is the on-chain token balances held by every pool deployed by the Blend V2 pool factory; borrowed is each reserve's outstanding debt (d_supply * d_rate).`,
  stellar: {
    tvl, borrowed,
  },
};
