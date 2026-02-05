const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider } = require("./helper/solana");
const { addUniV3LikePosition } = require("./helper/unwrapLPs");

// DefiTuna Liquidity allows adding liquidity to both DefiTuna’s own pools
// and to Orca pools. Unlike standard liquidity provision, DefiTuna enables
// increasing the size of a position using borrowed funds.
// To calculate TVL, all open positions are taken into account, and the amount
// of funds locked in them is computed. Since both types of pools are concentrated
// liquidity pools, addUniV3LikePosition is used.
async function tvl(api) {
  // We need DefiTuna, DefiTuna AMM (aka Fusion) and Orca Whirlpool programs.
  // fusion program tvl is calculated in defituna.js
  // AMMs are required to get current tick position only.
  const provider = getProvider(api.chain);
  const tunaProgram = new Program(tunaIDL, provider);
  const orcaProgram = new Program(whirlpoolIDL, provider);

  // Requesting all open positions
  const positions = await tunaProgram.account["tunaLpPosition"].all();
  const openPositions = positions.filter(
    (pos) => Object.keys(pos.account.state)[0] === "normal"
  );

  const orcaPoolsAddr = openPositions
    .filter((pos) => Object.keys(pos.account.marketMaker)[0] === "orca")
    .map((pos) => pos.account.pool.toString());
  const orcaPoolsAddrUnique = [...new Set(orcaPoolsAddr)].map(
    (addr) => new PublicKey(addr)
  );
  const orcaPools = await orcaProgram.account["whirlpool"].fetchMultiple(
    orcaPoolsAddrUnique
  );
  const orcaPoolsMap = Object.fromEntries(
    orcaPoolsAddrUnique.map((pubkey, i) => [pubkey.toString(), orcaPools[i]])
  );

  // For each position
  for (const position of openPositions) {
    const pool = position.account.pool.toString();

    // Get current tick from pool account state
    const tickCurrentIndex = Object.hasOwn(orcaPoolsMap, pool)
      ? orcaPoolsMap[pool].tickCurrentIndex : undefined;

    // Add concentrated liquidity position to TVL
    if(tickCurrentIndex!==undefined)
      addUniV3LikePosition({
      api,
      tickLower: position.account.tickLowerIndex,
      tickUpper: position.account.tickUpperIndex,
      tick: tickCurrentIndex,
      liquidity: position.account.liquidity,
      token0: position.account.mintA.toString(),
      token1: position.account.mintB.toString(),
    });
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL is calculated by summing up the liquidity of all open positions.",
  start: "2024-11-29",
  hallmarks: [
    ['2025-07-30', 'TUNA token launched'],
  ],
};

// DefiTuna IDL (TunaLpPosition account only)
const tunaIDL = {
  address: "tuna4uSQZncNeeiAMKbstuxA9CUkHH6HmC64wgmnogD",
  metadata: {
    name: "tuna",
    version: "3.0.0",
    spec: "0.1.0",
    description: "DefiTuna",
  },
  instructions: [],
  accounts: [
    {
      name: "TunaLpPosition",
      discriminator: [76, 197, 161, 51, 232, 15, 137, 220],
    },
  ],
  errors: [],
  types: [
    {
      name: "TunaLpPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "version", docs: ["Struct version"], type: "u16" },
          {
            name: "bump",
            docs: ["Bump seed for the tuna position account"],
            type: { array: ["u8", 1] },
          },
          {
            name: "authority",
            docs: ["The authority address used for managing the position"],
            type: "pubkey",
          },
          {
            name: "pool",
            docs: ["Liquidity pool address this position belongs to"],
            type: "pubkey",
          },
          {
            name: "mint_a",
            docs: ["The mint address for token A"],
            type: "pubkey",
          },
          {
            name: "mint_b",
            docs: ["The mint address for token B"],
            type: "pubkey",
          },
          {
            name: "position_mint",
            docs: [
              "The mint address for the position token (minted and used in Orca/Fusion)",
            ],
            type: "pubkey",
          },
          {
            name: "liquidity",
            docs: ["Total minted liquidity"],
            type: "u128",
          },
          {
            name: "tick_lower_index",
            docs: ["Position lower tick"],
            type: "i32",
          },
          {
            name: "tick_upper_index",
            docs: ["Position upper tick"],
            type: "i32",
          },
          {
            name: "loan_shares_a",
            docs: ["The amount of shares borrowed by user from vault A."],
            type: "u64",
          },
          {
            name: "loan_shares_b",
            docs: ["The amount of shares borrowed by user from vault B."],
            type: "u64",
          },
          {
            name: "loan_funds_a",
            docs: [
              "The amount of funds borrowed by user from vault A. Doesn't include accrued interest.",
            ],
            type: "u64",
          },
          {
            name: "loan_funds_b",
            docs: [
              "The amount of funds borrowed by user from vault B. Doesn't include accrued interest.",
            ],
            type: "u64",
          },
          {
            name: "leftovers_a",
            docs: [
              "The leftovers are funds that couldn't be added to a pool as liquidity. They remain in the position token account.",
            ],
            type: "u64",
          },
          {
            name: "leftovers_b",
            docs: [
              "The leftovers are funds that couldn't be added to a pool as liquidity. They remain in the position token account.",
            ],
            type: "u64",
          },
          {
            name: "tick_entry_index",
            docs: [
              "OBSOLETE: Position entry tick index. (For position version <= 6)",
            ],
            type: "i32",
          },
          {
            name: "tick_stop_loss_index",
            docs: [
              "OBSOLETE: Position stop loss tick index (for position version <= 6).",
            ],
            type: "i32",
          },
          {
            name: "tick_take_profit_index",
            docs: [
              "OBSOLETE: Position stop loss tick index (for position version <= 6).",
            ],
            type: "i32",
          },
          {
            name: "state",
            docs: ["Position state: normal, liquidated, closed by limit order"],
            type: { defined: { name: "TunaPositionState" } },
          },
          {
            name: "unused_1",
            docs: [
              "OBSOLETE: Which token to swap collateral to when a limit order is executed. (For position version <= 4)",
            ],
            type: "u8",
          },
          {
            name: "compounded_yield_a",
            docs: [
              "Yield amount in token A that has already been collected and compounded into the position.",
            ],
            type: "u64",
          },
          {
            name: "compounded_yield_b",
            docs: [
              "Yield amount in token B that has already been collected and compounded into the position.",
            ],
            type: "u64",
          },
          {
            name: "flags",
            docs: [
              "Position options.",
              "Bits 0..1: Stop loss swap. 0 - no swap, 1 - swap to token A, 2 - swap to token B",
              "Bits 2..3: Take profit swap. 0 - no swap, 1 - swap to token A, 2 - swap to token B",
              "Bits 4..5: Yield auto compounding. 0 - don't compound, 1 - compound yield, 2 - compound yield with leverage",
            ],
            type: "u32",
          },
          {
            name: "market_maker",
            docs: ["Market maker (Orca, Fusion)"],
            type: { defined: { name: "MarketMaker" } },
          },
          {
            name: "entry_sqrt_price",
            docs: ["Position entry sqrt price."],
            type: "u128",
          },
          {
            name: "lower_limit_order_sqrt_price",
            docs: [
              "Position lower limit order sqrt price (stop loss for a LONG position).",
            ],
            type: "u128",
          },
          {
            name: "upper_limit_order_sqrt_price",
            docs: [
              "Position upper limit order sqrt price (take profit for a LONG position).",
            ],
            type: "u128",
          },
          {
            name: "rebalance_threshold_ticks",
            docs: [
              "The position might be re-balanced if the current tick is lower than tick_lower_index or",
              "higher than tick_higher_index by a threshold value.",
            ],
            type: "u32",
          },
          {
            name: "reserved",
            docs: ["Reserved"],
            type: { array: ["u8", 9] },
          },
        ],
      },
    },
    {
      name: "TunaPositionState",
      repr: { kind: "rust" },
      type: {
        kind: "enum",
        variants: [
          { name: "Normal" },
          { name: "Liquidated" },
          { name: "ClosedByLimitOrder" },
        ],
      },
    },
    {
      name: "MarketMaker",
      repr: { kind: "rust" },
      type: {
        kind: "enum",
        variants: [{ name: "Orca" }, { name: "Fusion" }],
      },
    },
  ],
};

// Orca Whirlpool IDL (Whirlpool account only)
const whirlpoolIDL = {
  address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
  metadata: { name: "whirlpool", version: "0.3.6", spec: "0.1.0" },
  instructions: [],
  accounts: [
    {
      name: "Whirlpool",
      discriminator: [63, 149, 209, 12, 225, 128, 99, 9],
    },
  ],
  errors: [],
  types: [
    {
      name: "Whirlpool",
      type: {
        kind: "struct",
        fields: [
          { name: "whirlpools_config", type: "pubkey" },
          { name: "whirlpool_bump", type: { array: ["u8", 1] } },
          { name: "tick_spacing", type: "u16" },
          { name: "fee_tier_index_seed", type: { array: ["u8", 2] } },
          { name: "fee_rate", type: "u16" },
          { name: "protocol_fee_rate", type: "u16" },
          { name: "liquidity", type: "u128" },
          { name: "sqrt_price", type: "u128" },
          { name: "tick_current_index", type: "i32" },
          { name: "protocol_fee_owed_a", type: "u64" },
          { name: "protocol_fee_owed_b", type: "u64" },
          { name: "token_mint_a", type: "pubkey" },
          { name: "token_vault_a", type: "pubkey" },
          { name: "fee_growth_global_a", type: "u128" },
          { name: "token_mint_b", type: "pubkey" },
          { name: "token_vault_b", type: "pubkey" },
          { name: "fee_growth_global_b", type: "u128" },
          { name: "reward_last_updated_timestamp", type: "u64" },
          {
            name: "reward_infos",
            type: {
              array: [{ defined: { name: "WhirlpoolRewardInfo" } }, 3],
            },
          },
        ],
      },
    },
    {
      name: "WhirlpoolRewardInfo",
      docs: [
        "Stores the state relevant for tracking liquidity mining rewards at the `Whirlpool` level.",
        "These values are used in conjunction with `PositionRewardInfo`, `Tick.reward_growths_outside`,",
        "and `Whirlpool.reward_last_updated_timestamp` to determine how many rewards are earned by open",
        "positions.",
      ],
      type: {
        kind: "struct",
        fields: [
          { name: "mint", docs: ["Reward token mint."], type: "pubkey" },
          {
            name: "vault",
            docs: ["Reward vault token account."],
            type: "pubkey",
          },
          {
            name: "authority",
            docs: [
              "Authority account that has permission to initialize the reward and set emissions.",
            ],
            type: "pubkey",
          },
          {
            name: "emissions_per_second_x64",
            docs: [
              "Q64.64 number that indicates how many tokens per second are earned per unit of liquidity.",
            ],
            type: "u128",
          },
          {
            name: "growth_global_x64",
            docs: [
              "Q64.64 number that tracks the total tokens earned per unit of liquidity since the reward",
              "emissions were turned on.",
            ],
            type: "u128",
          },
        ],
      },
    },
  ],
};
