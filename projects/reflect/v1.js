const { getProvider } = require("../helper/solana");
const { queryAllium } = require("../helper/allium");
const { PublicKey } = require("@solana/web3.js");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

// Reflect V1 core program (https://reflect.money), the original deployment.
// Separate program and DefiLlama dashboard from V2 (./v2.js). V1 uses a DIFFERENT on-chain
// account schema than V2, so this adapter is intentionally standalone and shares no decoding
// with v2.js. Like V2, users deposit an SPL (USDC, USDT) into a lending strategy that routes
// the collateral across external yield venues; TVL is read entirely from on-chain account
// data, deserialised manually (no IDL/anchor coder).
const PROGRAM_ID = new PublicKey("rFLctqnUuxLmYsW5r9zNujfJx9hGpnP1csXr9PYwVgX");

// Historical backfill: getProgramAccounts has no time-travel, so for past dates we proxy TVL
// by each strategy's receipt-token supply (every receipt token is minted 1:1 against deposited
// collateral, so circulating supply ≈ collateral, within accrued yield ≈ a few %). The supply
// per day is summed from Allium's solana.assets.balances_daily and valued in the underlying
// stablecoin (both are 6-decimal, so raw receipt units map 1:1 to underlying units).
// NOTE: this relies on Allium's balances_daily being a FULL daily snapshot (one row per holder
// per day, carried forward) — the same assumption the repo's sumTokens2_historical makes — so a
// plain `SUM(raw_amount) WHERE date = T` equals total supply. (Some providers' daily-balance
// tables are change-based and would need a carry-forward; Allium's is not.)
// Curve cross-validated two ways (cumulative mint−burn, and carry-forward balances): peak
// ~$10.0M on 2025-10-31, ~$1.90M today (matches the live receipt supply), launch 2025-09-11.
const RECEIPT_TO_UNDERLYING = {
  usd63SVWcKqLeyNHpmVhZGYAqfE5RHE8jwqjRA2ida2: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC+ -> USDC
  uSDtYeMVYuQwhziLKMpdMz74WPFNytoWLGGiU9SDnZx: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT+ -> USDT
};

// 8-byte account discriminators.
const MAIN_DISC = Buffer.from([103, 173, 93, 26, 84, 137, 56, 96]); // Anchor `Main`
const STRATEGY_CONTROLLER_DISC = Buffer.from([13, 167, 93, 202, 196, 161, 163, 0]);

// `Main` layout (Borsh): disc(8) + bump(1) + AccessControl(362) + spls_main: Vec<SplMain> ...
// V1's AccessControl is 362 bytes (vs 386 in V2), so the vec length prefix sits at offset 371.
const SPLS_MAIN_OFFSET = 8 + 1 + 362; // 371

// `StrategyController` layout: disc(8) + Base + Rack registry + component data region.
// Base starts with bump(u8) index(u8) status(u8) mint([u8;32]) ...  (V2 has strategy_type
// where V1 has status; both are 1-byte, so the mint offset is unchanged.)
const STRATEGY_INDEX_OFFSET = 9; // disc(8) + bump(1)
// V1's Base is a fixed 1018 bytes (vs 1100 in V2), shifting the rack down accordingly.
const RACK_OFFSET = 8 + 1018; // 1026 - start of the 8-entry component registry
const RACK_REGISTRY_SIZE = 8 * 6; // 8 components * (type u8 + offset u16 + size u16 + version u8)
const COMPONENT_DATA_OFFSET = RACK_OFFSET + RACK_REGISTRY_SIZE; // 1074
const COMPONENT_TYPE_AUTOCOMPOUND = 1;

// Map each strategy index -> its underlying collateral mint, from Main's SPL registry.
// V1 SplMain (Borsh): main_spl_index(u8) mint([u8;32]) oracle([u8;32]) fee(u64) precision(u8)
//                     strategy_indices: Vec<u8> deposits_suspended(bool)
// (V1 carries an extra `oracle` pubkey that V2's SplMain does not.)
function parseStrategyMints(data) {
  let o = SPLS_MAIN_OFFSET;
  const count = data.readUInt32LE(o);
  o += 4;
  const strategyToMint = {};
  for (let i = 0; i < count; i++) {
    o += 1; // main_spl_index
    const mint = new PublicKey(data.slice(o, o + 32)).toBase58();
    o += 32;
    o += 32; // oracle
    o += 8; // fee
    o += 1; // precision (DefiLlama applies token decimals at pricing time)
    const indicesLen = data.readUInt32LE(o);
    o += 4;
    for (let j = 0; j < indicesLen; j++) {
      const strategyIndex = data[o + j];
      if (strategyToMint[strategyIndex] === undefined) strategyToMint[strategyIndex] = mint;
    }
    o += indicesLen;
    o += 1; // deposits_suspended
  }
  return strategyToMint;
}

// Walk the strategy controller's component registry and return the
// AutoCompound component's `deposited_vault_value` (first u64): the total
// collateral currently attributed to vault holders, in the underlying's base units.
function readDepositedVaultValue(data) {
  for (let i = 0; i < 8; i++) {
    const entry = RACK_OFFSET + i * 6;
    const componentType = data[entry];
    if (componentType === 0) break; // registry is contiguous; None marks the end
    if (componentType === COMPONENT_TYPE_AUTOCOMPOUND) {
      const componentOffset = data.readUInt16LE(entry + 1);
      return data.readBigUInt64LE(COMPONENT_DATA_OFFSET + componentOffset);
    }
  }
  return 0n;
}

// Hard stop. On the evening of 2026-04-01 the strategy's capital allocated to Drift Protocol was
// lost in the Drift exploit and the protocol was frozen. Because it is frozen, the on-chain
// deposited_vault_value (and the receipt-token supply) are stuck at their pre-exploit value and
// no longer reflect reality — real TVL is 0 once the loss landed. April 1 still shows its
// pre-hack value; we force 0 from 2026-04-02 onward, regardless of the (stale) on-chain field.
const EXPLOIT_DATE = "2026-04-01"; // chart annotation: when the Drift exploit happened
const DEAD_FROM = "2026-04-02"; // first fully-zero day (hack landed the evening before)
const DEAD_FROM_TS = Math.floor(Date.parse(DEAD_FROM + "T00:00:00Z") / 1000);

const SECONDS_PER_DAY = 86400;
const startOfTodayUTC = () => Math.floor(Math.floor(Date.now() / 1000) / SECONDS_PER_DAY) * SECONDS_PER_DAY;

// Historical path: sum each receipt token's circulating supply on the requested day from
// Allium and value it in the underlying stablecoin. Requires ALLIUM_API_KEY in the env.
async function tvlHistorical(api) {
  const date = new Date(api.timestamp * 1000).toISOString().slice(0, 10);
  const mints = Object.keys(RECEIPT_TO_UNDERLYING).map((m) => `'${m}'`).join(", ");
  const sql = `
    SELECT mint, SUM(raw_amount) AS supply
    FROM solana.assets.balances_daily
    WHERE date = '${date}'
      AND mint IN (${mints})
    GROUP BY mint`.trim();
  const rows = await queryAllium(sql);
  for (const row of rows || []) {
    const underlying = RECEIPT_TO_UNDERLYING[row.mint];
    if (underlying && row.supply) api.add(underlying, String(row.supply));
  }
}

async function tvl(api) {
  // Hard stop: at/after the Drift-exploit cutoff, real TVL is 0 — never report the frozen value.
  if (api.timestamp >= DEAD_FROM_TS) return;

  // DefiLlama backfills by re-running at past timestamps; route those to the supply proxy.
  if (api.timestamp && api.timestamp < startOfTodayUTC()) return tvlHistorical(api);

  const connection = getProvider().connection;

  // Filter by discriminator: V1 has thousands of UserPermissions accounts, so never fetch
  // the whole program — only the single Main account and the handful of strategy controllers.
  const mainAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(MAIN_DISC) } }],
  });
  if (!mainAccounts.length) throw new Error("Reflect V1: Main account not found");
  const strategyToMint = parseStrategyMints(mainAccounts[0].account.data);

  const controllers = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(STRATEGY_CONTROLLER_DISC) } }],
  });

  for (const { account: { data } } of controllers) {
    const strategyIndex = data[STRATEGY_INDEX_OFFSET];
    const mint = strategyToMint[strategyIndex];
    if (!mint) continue; // no underlying collateral registered for this strategy
    const deposited = readDepositedVaultValue(data);
    if (deposited > 0n) api.add(mint, deposited.toString());
  }
}

module.exports = {
  timetravel: true,
  start: 1757548800, // 2025-09-11, first strategy / receipt mint creation
  deadFrom: DEAD_FROM, // 2026-04-02: first fully-zero day after the 2026-04-01 evening Drift exploit
  hallmarks: [[EXPLOIT_DATE, "Drift Protocol exploit; strategy funds lost and protocol frozen"]],
  methodology:
    "Live TVL is the total collateral attributed to vault holders across Reflect V1's lending strategies, read on-chain from each strategy controller's AutoCompound deposited_vault_value field and valued in that strategy's underlying SPL (USDC, USDT) resolved from the Main account's SPL registry. Historical TVL (backfill) proxies each strategy by its receipt-token circulating supply for that day (summed from Allium), valued 1:1 in the underlying stablecoin — supply tracks deposited collateral within accrued yield (~a few %). On the evening of 2026-04-01 the capital allocated to Drift was lost in the Drift exploit and the protocol was frozen; because it is frozen the on-chain value is stale, so TVL is forced to 0 from 2026-04-02 onward (deadFrom). Deposited collateral was routed into external venues listed separately on DefiLlama, so TVL is marked doublecounted.",
  doublecounted: true,
  solana: { tvl },
};
