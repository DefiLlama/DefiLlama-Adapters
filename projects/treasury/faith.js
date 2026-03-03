const sui = require("../helper/chain/sui");

const GLOBAL = "0x64df88bb0241f03a2ab91ed61f6b9c0c596e28d6273b16fd01d9bf9f8a9641a0";
const SUI_COIN_TYPE = "0x2::sui::SUI";

const asBigInt = (v) => BigInt(v ?? 0);

async function tvl(api) {
  const global = await sui.getObject(GLOBAL);

  const vaults = global?.fields?.vaults?.fields;
  if (!vaults) return api.getBalances();

  const buckets = ["faithgg", "manifest_buyback", "ops", "pilgrimage"];

  for (const k of buckets) {
    const bal = vaults?.[k]?.fields?.balance;
    if (bal) api.add(SUI_COIN_TYPE, asBigInt(bal).toString());
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true,
  methodology:
    "Treasury adapter: counts SUI held in FAITH protocol-owned vault buckets stored inside the Global object (faithgg, manifest_buyback, ops, pilgrimage). These funds are not withdrawable by users.",
  sui: { tvl },
};
