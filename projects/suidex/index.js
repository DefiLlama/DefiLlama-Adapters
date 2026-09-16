const sui = require("../helper/chain/sui");
const { get } = require("../helper/http");

// V2 AMM Factory
const FACTORY_ID =
  "0x81c286135713b4bf2e78c548f5643766b5913dcd27a8e76469f146ab811e922d";

// Locked Token Vault — holds VICTORY tokens locked by users in the Token Locker
const LOCKED_TOKEN_VAULT_ID =
  "0x3632b8acce355fc8237998d44f1a68e58baac95f199714cdef5736d580dc6bf1";

// VICTORY token type
const VICTORY_TOKEN_TYPE =
  "0xbfac5e1c6bf6ef29b12f7723857695fd2f4da9a11a7d88162c15e9124c243a4a::victory_token::VICTORY_TOKEN";

// ─── V3 CLMM pools ────────────────────────────────────────────────────────
// SuiDex V3 pools are created with transfer::share_object and are NOT recorded
// in any registry — there is no on-chain equivalent of the V2 factory's
// all_pairs, so the pool set cannot be enumerated from chain state. Querying
// PoolCreatedEvent does not work either: it only returns recent events, so it
// silently misses pools created months ago.
//
// So: read the live list from the public SuiDex API, and union it with the
// known pool ids below. The static list guarantees the adapter keeps working
// if the API is unreachable; the API call means pools added later are picked
// up without another PR.
const V3_POOLS_API = "https://dex.suidex.org/api/v3/pools";

const V3_POOL_IDS = [
  "0xdf8ccfcc10f7daf14e31101c8ca6ac05eaa953afad14195fd2db3a41bad4b284", // SUI/SUITRUMP 0.32%
  "0x04db19eb0d0b7518005cc63c0530954f494460de42074749e6b702c443ead952", // SUI/USDC 0.038%
  "0x39d5ba22e01e45bc4129ec28a0bef52e8fee8db5d07d337adf9540e3cb9074cf", // SUI/TREE 0.25%
  "0xe27a85b339b41aea7d513c1373ef2f3babc88e468d9b650bb778265bfdc5f3b7", // USDC/USDSUI 0.004%
  "0x02c83820cc8412e103d6520424a380e207e43033cad040e72331a719335f0629", // SUI/VICTORY 0.35%
  "0x51370981fc19b08c840ff39cca3f36c03f396d26a85f522f20f741f1cff014af", // SUI/USDC 0.01%
  "0xada785710f07083dbfaf2b38592a75bc5f2b8351bd94ec3c5233103b3a46db35", // BTC/USDC 0.03%
  "0x4941733c86b892bd028c6eb83cde5ca6161989e950f40e54d8b5b7f9f6228d66", // USDC/SWARM 0.03%
  "0x8e69fd04b053901e16641d36745527cd4334fd7abc2c999de249f00f64678e27", // USDC/VICTORY 0.27%
  "0xabd8ce857eff33d836acbeab4163efb9ed9bfee039a380d043ef4955e0862e4f", // USDC/SWARM 1.00%
  "0x6e8de5c12744e1d6fae10a0c89fe99a370c178875c7ce0bb18cedd0aa44a800d", // SUI/WAL 0.13%
  "0x5c88d43534389ebb2b7c3cacf9dde776c85b1cac1569207367ade1b858d294eb", // SUI/DEEP 0.10%
  "0x21e920ad49b2b3e49e1fe8e6d5bcb721378833178e1d3b50dc077799513876ac", // SUI/BOOM 0.30%
  "0x6692817a02dfc518a023e5ef4dc21dffb3b1242aadfbd87a45d59bb6dbdc1cbc", // WAL/VICTORY 0.30%
  "0xbd049d783d9cfbf9cf9ba746f8d457a48b7f2354baa0dc7d4339ccb73236ed20", // WAL/VICTORY 0.05%
  "0x5810870f31d922cee1221c92f74b90ed68eb62758169a363d83b66b8c83c1ba9", // MAGMA/VICTORY 0.30%
  "0x2042df5eef72f5f6755de8e67a0d416436882b9833709dea7cf92d32a6f56e71", // MBP/PANS 1.00%
  "0xa89656bd7d924271fdc183e54680a75455c7786ee83808fa3adf3e1c09ef344c", // TREE/USDC 0.30%
  "0x541599a0b7492431b89fc2b9715601cc3b89f38f4282e365be92e84ed9c736a3", // USDC/MAGMA 0.20%
  "0xe85ce658794b7a4bfa6ba3ba0b4d20e0be3e5c778c31be9b506587123eedd15e", // XAUM/USDC 0.05%
];

async function getV3PoolIds() {
  const ids = new Set(V3_POOL_IDS);
  try {
    const pools = await get(V3_POOLS_API);
    const list = Array.isArray(pools) ? pools : pools?.pools ?? [];
    for (const p of list) {
      const id = p?.pool_id;
      if (typeof id === "string" && /^0x[0-9a-f]{64}$/i.test(id)) ids.add(id);
    }
  } catch (e) {
    // API unreachable — fall back to the static list rather than dropping V3.
  }
  return [...ids];
}

async function tvl(api) {
  // V2: Read Factory object to get all pair IDs
  const factory = await sui.getObject(FACTORY_ID);
  const pairIds = factory.fields.all_pairs;
  const pools = await sui.getObjects(pairIds);

  pools.forEach(({ type, fields }) => {
    const [token0, token1] = type.replace(">", "").split("<")[1].split(", ");
    api.add(token0, fields.reserve0 ?? fields.reserve_0);
    api.add(token1, fields.reserve1 ?? fields.reserve_1);
  });

  // V3: read reserves from each CLMM pool object
  const v3PoolIds = await getV3PoolIds();
  const v3Pools = await sui.getObjects(v3PoolIds);

  v3Pools.forEach((pool) => {
    // A pool id that no longer resolves comes back empty — skip it rather than
    // letting one bad entry throw and take the whole adapter to zero.
    if (!pool?.type || !pool?.fields) return;
    // Pool type: 0xPKG::pool::Pool<TokenX, TokenY>
    const [tokenX, tokenY] = pool.type.replace(">", "").split("<")[1].split(", ");
    api.add(tokenX, pool.fields.reserve_x);
    api.add(tokenY, pool.fields.reserve_y);
  });
}

async function staking(api) {
  // Victory Token Locker: users lock VICTORY tokens for enhanced rewards.
  // The vault stores locked balance in a Balance<VICTORY> field, not as Coin objects.
  const vault = await sui.getObject(LOCKED_TOKEN_VAULT_ID);
  api.add(VICTORY_TOKEN_TYPE, vault.fields.locked_balance);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the sum of token reserves across all SuiDex V2 AMM and V3 CLMM liquidity pools. V2 pairs come from the factory's all_pairs. V3 pools are read from the SuiDex public pool list, unioned with a known pool set so the adapter still works if that endpoint is unreachable. Staking includes VICTORY tokens locked in the Token Locker contract.",
  sui: {
    tvl,
    staking,
  },
};
