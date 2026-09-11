const { callSoroban, parseScVal } = require("../helper/chain/stellar");
const { get } = require("../helper/http");
const { getCache, setCache } = require("../helper/cache");
const methodologies = require("../helper/methodologies");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";
const POOL_FACTORY_V2 = "CDSYOAVXFY7SM5S64IZPPPYB4GVGGLMQVFREPSQQEZVIWXX5R23G4QSU";
const SCALAR_12 = 10n ** 12n; // v2 b_rate/d_rate fixed-point scalar

// All pools ever deployed by the v2 pool factory ('deploy' events, full
// history via stellar.expert), plus whatever is currently in the backstop
// reward zone (can be empty - pools get rotated out, so it alone is not a
// reliable enumeration source). The list is persisted in the llama cache and
// only ever grows, so a stellar.expert outage falls back to the last known
// pool set instead of failing.
async function getPools() {
  const pools = new Set(await callSoroban(BACKSTOP_ID, "reward_zone"));
  const cached = (await getCache("blend-pools-v2", "stellar"))?.pools ?? [];
  cached.forEach((p) => pools.add(p));

  try {
    let cursor;
    while (true) {
      const url = `https://api.stellar.expert/explorer/public/contract/${POOL_FACTORY_V2}/events?order=asc&limit=200` + (cursor ? `&cursor=${cursor}` : "");
      const { _embedded: { records } } = await get(url);
      if (!records.length) break;
      for (const r of records) {
        if (r.topics?.[0] !== "deploy") continue;
        pools.add(parseScVal(Buffer.from(r.bodyXdr, "base64"), 0).value);
      }
      cursor = records[records.length - 1].id;
    }
    if (pools.size > cached.length) await setCache("blend-pools-v2", "stellar", { pools: [...pools] });
  } catch (e) {
    if (!cached.length) throw e;
    console.log("blend-pools-v2: stellar.expert failed, using cached pool list:", e.message);
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
