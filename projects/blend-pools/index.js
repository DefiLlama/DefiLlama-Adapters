const { callSoroban, parseScVal, decodeStrKey, SOROBAN_RPC_URL } = require("../helper/chain/stellar");
const { post } = require("../helper/http");
const methodologies = require("../helper/methodologies");

const SCALAR_9 = 10n ** 9n; // v1 b_rate/d_rate fixed-point scalar

// The v1 pool factory (CCZD6ESMOGMPWH2KRO4O7RGTAPGTUPFWFQBELQSS7ZUK63V3TZWETGAG)
// is superseded by v2 and no new v1 markets can be listed, so this is the
// complete, final set of pools it ever deployed ('deploy' events).
const POOLS = [
  "CDVQVKOY2YSXS2IC7KN6MNASSHPAO7UN2UR2ON4OI2SKMFJNVAMDX6DP",
  "CBP7NO6F7FRDHSOFQBT2L2UWYIZ2PU76JKVRYAQTG3KZSQLYAOKIF2WB",
  "CDU4RTOYFZERUD727WW6VRXH5IK35GLCXCPK5ILUYRLLYYMTYSCJXUEA",
  "CCTZXMW3DJIKDI3UVDUJR6PM4WFFEB5RIWDXJBGIEFBD5XFHI26LZ5BU",
  "CBVOPI6QC6OWVCOEZDCFELAGQNAOHUS4CWOKAVADKQZXVSWR2R5IAKO7",
  "CADP6E57HEJOAWHBSTEDJYFJSRU5C5D7YBHFEET23CAHD2KGD4XKCFMS",
  "CB22FIF722FWWHKDX6URY2LHTOS6TWLPXL2IOGY5QS6YNQXTRBDCNPD3",
  "CDL3EQ4P3DQH5Q6BT3AINZCCJKUHSXPJAOF7YP3JE7MFJX7FGXHPT27B",
  "CDJ6Q3A2NUK3ANWFGXCHUBPQJXKAXBHNUVILGTEOTSEH2NDZC4FI632B",
  "CDAKUFO3WOUG2DLY6XTNRKBSK53VJTJXMTOUEMPKOWN4R756OFICXWID",
  "CDIUMS2ZNGNGHDRBKFXS4QU23ATPYCTDBUHGZ6FS2MPAEY37FAC4JD3R",
  "CB7V7T52OLKMBC5QPL7GH2OKR4XV6YWDURUXSAAAFCPSNX7EPBYF5DJE",
  "CDK4KXOYG332TO7VDARUJ66RMQTEADFSZY3RDJZQBS7ZFCD25RV52NXP",
  "CDE65QK2ROZ32V2LVLBOKYPX47TYMYO37Z6ASQTBRTBNK53C7C6QF4Y7",
  "CBQPFUWOMGTGC5X65J52Z2OHFWYWFCA3TMYCVY6G2T2SB326WW45HF2G",
  "CAQF5KNOFIGRI24NQRRGUPD46Q45MGMXZMRTQFXS25Y4NZVNPT34GM6S",
  "CDJD2PFCHD2R4SHP3WJ4C6JEF445ODSO74WOCKNFS25I4XI7HMLK3VYO",
];

// ---- XDR builders: v1 pools expose no getters, reserve data lives in
// persistent contract storage and is read via getLedgerEntries ----
const SCV = { SYMBOL: 15, VEC: 16, ADDRESS: 18 };
function scSymbol(s) {
  const pad = (4 - (s.length % 4)) % 4;
  const b = Buffer.alloc(8 + s.length + pad);
  b.writeUInt32BE(SCV.SYMBOL, 0); b.writeUInt32BE(s.length, 4); b.write(s, 8);
  return b;
}
function scAddress(c) {
  const b = Buffer.alloc(8);
  b.writeUInt32BE(SCV.ADDRESS, 0); b.writeUInt32BE(1, 4); // SC_ADDRESS_TYPE_CONTRACT
  return Buffer.concat([b, decodeStrKey(c)]);
}
function scVec(items) {
  const b = Buffer.alloc(12);
  b.writeUInt32BE(SCV.VEC, 0); b.writeUInt32BE(1, 4); b.writeUInt32BE(items.length, 8);
  return Buffer.concat([b, ...items]);
}
// LedgerKey::ContractData { contract, key, durability: PERSISTENT }
function contractDataKey(contract, keyScVal) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(6, 0); head.writeUInt32BE(1, 4); // CONTRACT_DATA, SCAddress CONTRACT
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(1, 0); // PERSISTENT
  return Buffer.concat([head, decodeStrKey(contract), keyScVal, tail]).toString("base64");
}
// ContractDataEntry { ext(4), contract SCAddress(36), key SCVal, durability(4), val SCVal }
// preceded by LedgerEntryData type(4); the key is variable-length, parse past it
function parseContractDataVal(entryXdrB64) {
  const buf = Buffer.from(entryXdrB64, "base64");
  const key = parseScVal(buf, 44);
  return parseScVal(buf, key.offset + 4).value;
}

async function getLedgerEntries(keys) {
  const out = {};
  for (let i = 0; i < keys.length; i += 200) {
    const res = await post(SOROBAN_RPC_URL, {
      jsonrpc: "2.0", id: 1, method: "getLedgerEntries",
      params: { keys: keys.slice(i, i + 200) },
    });
    if (res.error) throw new Error(`Soroban RPC error: ${JSON.stringify(res.error)}`);
    for (const e of res.result.entries ?? []) out[e.key] = parseContractDataVal(e.xdr);
  }
  return out;
}

let _poolAssets;
// [{ pool, assets: [address] }] from each pool's persistent ResList entry
async function getPoolAssets() {
  if (!_poolAssets) _poolAssets = (async () => {
    const keys = POOLS.map((p) => contractDataKey(p, scSymbol("ResList")));
    const entries = await getLedgerEntries(keys);
    return POOLS
      .map((pool, i) => ({ pool, assets: entries[keys[i]] ?? [] }))
      .filter(({ assets }) => assets.length);
  })();
  return _poolAssets;
}

// tvl: actual token balances held by each pool contract
async function tvl(api) {
  for (const { pool, assets } of await getPoolAssets())
    for (const asset of assets) {
      try {
        api.add(asset, (await callSoroban(asset, "balance", [pool])).toString());
      } catch (e) { /* broken/non-token reserve asset - unpriceable, skip */ }
    }
}

// borrowed: outstanding debt from each reserve's ResData (d_supply * d_rate)
async function borrowed(api) {
  const poolAssets = await getPoolAssets();
  const calls = poolAssets.flatMap(({ pool, assets }) => assets.map((asset) => ({ pool, asset })));
  const keys = calls.map(({ pool, asset }) => contractDataKey(pool, scVec([scSymbol("ResData"), scAddress(asset)])));
  const entries = await getLedgerEntries(keys);
  calls.forEach(({ asset }, i) => {
    const data = entries[keys[i]];
    if (data) api.add(asset, ((data.d_supply * data.d_rate) / SCALAR_9).toString());
  });
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is the on-chain token balances held by every pool deployed by the Blend V1 pool factory; borrowed is each reserve's outstanding debt (d_supply * d_rate).`,
  stellar: {
    tvl, borrowed,
  },
};
