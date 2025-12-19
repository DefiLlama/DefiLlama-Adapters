const sui = require("../helper/chain/sui");

// Use the *object id* (stable), not PKG
const GLOBAL = "0x64df88bb0241f03a2ab91ed61f6b9c0c596e28d6273b16fd01d9bf9f8a9641a0";
const SUI_COIN_TYPE = "0x2::sui::SUI";

// helper: Move JSON numbers come back as strings
const asBigInt = (v) => BigInt(v ?? 0);

async function tvl(api) {
  const global = await sui.getObject(GLOBAL);

  // global.content.fields.vaults.fields.<bucket>.fields.balance
  // but via helper, you get the Move "content" already: so it's just `fields`
  const vaults = global?.fields?.vaults?.fields;
  if (!vaults) return api.getBalances();

  // Count every SUI bucket inside vaults (you can add more later if you add vault types)
  const buckets = ["faithgg", "manifest_buyback", "ops", "pilgrimage"];

  for (const k of buckets) {
    const bal = vaults?.[k]?.fields?.balance;
    if (bal) api.add(SUI_COIN_TYPE, asBigInt(bal).toString());
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true, // pure chain reads at given block heights
  methodology:
    "Counts SUI held in the FAITH protocol Vaults (faithgg, manifest_buyback, ops, pilgrimage) stored inside the Global object.",
  sui: { tvl },
};
