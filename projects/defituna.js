const { getProvider, sumTokens2 } = require("./helper/solana");
const { Program } = require("@coral-xyz/anchor");

// DefiTuna AMM is a concentrated liquidity AMM that supports limit orders at the smart contract level.
// DefiTuna Liquidity uses it to provide leveraged liquidity.
// To calculate TVL, all AMM pools are iterated over, and for each pool the two vaults are taken and
// the sum of the assets held in these vaults is computed.
async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(fusionammIDL, provider);
  const pools = await program.account["fusionPool"].all();
  const tokenAccounts = pools
    .map(({ account }) => [account.tokenVaultA, account.tokenVaultB])
    .flat();
  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "The TVL is calculated by aggregating the balances of all token vaults across every DefiTuna AMM pool",
  start: "2025-06-03",
};

const fusionammIDL = {
  address: "fUSioN9YKKSa3CUC2YUc4tPkHJ5Y6XW1yz8y6F7qWz9",
  metadata: {
    name: "fusionamm",
    version: "1.0.11",
    spec: "0.1.0",
  },
  instructions: [],
  accounts: [
    {
      name: "FusionPool",
      discriminator: [254, 204, 207, 98, 25, 181, 29, 67],
    },
  ],
  errors: [],
  types: [
    {
      name: "FusionPool",
      type: {
        kind: "struct",
        fields: [
          { name: "bump", type: { array: ["u8", 1] } },
          { name: "version", type: "u16" },
          { name: "token_mint_a", type: "pubkey" },
          { name: "token_mint_b", type: "pubkey" },
          { name: "token_vault_a", type: "pubkey" },
          { name: "token_vault_b", type: "pubkey" },
          { name: "tick_spacing", type: "u16" },
          { name: "tick_spacing_seed", type: { array: ["u8", 2] } },
          { name: "fee_rate", type: "u16" },
          { name: "protocol_fee_rate", type: "u16" },
          { name: "clp_reward_rate", type: "u16" },
          { name: "order_protocol_fee_rate", type: "u16" },
          { name: "liquidity", type: "u128" },
          { name: "sqrt_price", type: "u128" },
          { name: "tick_current_index", type: "i32" },
          { name: "protocol_fee_owed_a", type: "u64" },
          { name: "protocol_fee_owed_b", type: "u64" },
          { name: "fee_growth_global_a", type: "u128" },
          { name: "fee_growth_global_b", type: "u128" },
          { name: "orders_total_amount_a", type: "u64" },
          { name: "orders_total_amount_b", type: "u64" },
          { name: "orders_filled_amount_a", type: "u64" },
          { name: "orders_filled_amount_b", type: "u64" },
          { name: "olp_fee_owed_a", type: "u64" },
          { name: "olp_fee_owed_b", type: "u64" },
          { name: "ma_sqrt_price", type: "u128" },
          { name: "last_swap_timestamp", type: "u64" },
          { name: "reserved", type: { array: ["u8", 116] } },
        ],
      },
    },
  ],
};
