const sui = require("../helper/chain/sui");
const { getConfig } = require("../helper/cache");

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
// So: read the live list from the public SuiDex API via getConfig, which
// caches the response and falls back to the last cached list if the API is
// unreachable.
const V3_POOLS_API = "https://dex.suidex.org/api/v3/pools";

async function getV3PoolIds() {
  const pools = await getConfig("suidex/v3-pools", V3_POOLS_API);
  const list = Array.isArray(pools) ? pools : pools?.pools ?? [];
  return list
    .map((p) => p?.pool_id)
    .filter((id) => typeof id === "string" && /^0x[0-9a-f]{64}$/i.test(id));
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
    "TVL is the sum of token reserves across all SuiDex V2 AMM and V3 CLMM liquidity pools. V2 pairs come from the factory's all_pairs. V3 pools are read from the SuiDex public pool list (cached, so the adapter still works if that endpoint is temporarily unreachable). Staking includes VICTORY tokens locked in the Token Locker contract.",
  sui: {
    tvl,
    staking,
  },
};
