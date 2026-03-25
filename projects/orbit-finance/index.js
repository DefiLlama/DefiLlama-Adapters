const { sumTokens2 } = require("../helper/solana");
const { get } = require("../helper/http");
const { Program } = require("@coral-xyz/anchor");
const { getProvider } = require("../helper/solana");

const ADAPTER_BASE = "https://orbit-dex.api.cipherlabsx.com";

// CIPHER native token mint
const CIPHER_MINT = "Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N";

async function tvl(api) {
  const provider = getProvider();
  const program = new Program(idl, provider);
  const accounts = await program.account.pool.all();
  const tokenAccounts = accounts.flatMap(({ account }) => [account.baseVault, account.quoteVault]);
  return sumTokens2({ api, tokenAccounts, blacklistedTokens: [CIPHER_MINT] });  // exclude projects own token from the tvl
}

/**
 * Staking TVL: total CIPHER locked in Streamflow staking streams.
 * Staked CIPHER is distributed across per-user escrow accounts so we
 * read the aggregate total from the adapter's Streamflow indexer.
 */
async function staking() {
  const data = await get(`${ADAPTER_BASE}/api/v1/streamflow/vaults`);
  const cipherVault = (data.vaults ?? []).find((v) => v.tokenMint === CIPHER_MINT);
  if (!cipherVault?.total_staked_raw) return {};
  return { ["solana:" + CIPHER_MINT]: cipherVault.total_staked_raw };
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking },
  methodology:
    "TVL is the sum of all token balances in CipherDLMM pool vaults (base + quote) on Solana. Staking TVL separately counts CIPHER locked in the Streamflow staking pool.",
};


const idl = {
  "address": "Fn3fA3fjsmpULNL7E9U79jKTe1KHxPtQeWdURCbJXCnM",
  "metadata": {"name": "orbit_finance", "version": "0.1.0", "spec": "0.1.0"},
  "instructions": [],
  "accounts": [{"name": "Pool", "discriminator": [241, 154, 109, 4, 17, 177, 109, 188]}],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Pool",
      "docs": [
        "Main pool account holding configuration, authorities, price cache and vaults.",
        "Fields are ordered to minimize padding for zero-copy compatibility."
      ],
      "serialization": "bytemuck",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "admin", "type": "pubkey"},
          {"name": "config_authority", "type": "pubkey"},
          {"name": "pause_guardian", "type": "pubkey"},
          {"name": "fee_withdraw_authority", "type": "pubkey"},
          {"name": "creator", "type": "pubkey"},
          {"name": "base_mint", "type": "pubkey"},
          {"name": "quote_mint", "type": "pubkey"},
          {"name": "base_vault", "type": "pubkey"},
          {"name": "quote_vault", "type": "pubkey"},
          {"name": "creator_fee_vault", "type": "pubkey"},
          {"name": "holders_fee_vault", "type": "pubkey"},
          {"name": "nft_fee_vault", "type": "pubkey"},
          {
            "name": "protocol_fee_vault",
            "docs": ["Protocol fee vault (12.5% of total swap fees)", "Can be permissionlessly swept to Squads multisig"],
            "type": "pubkey"
          },
          {"name": "lp_mint", "type": "pubkey"},
          {"name": "price_q64_64", "type": "u128"},
          {"name": "total_shares", "type": "u128"},
          {
            "name": "total_holder_units",
            "docs": [
              "Sync checkpoint for holder rewards index (per-pool).",
              "Used by `sync_reward_indexes` to aggregate deltas into global holder index."
            ],
            "type": "u128"
          },
          {
            "name": "total_nft_units",
            "docs": ["Sync checkpoint for NFT rewards index (per-pool).", "Used by `sync_reward_indexes` to aggregate deltas into global NFT index."],
            "type": "u128"
          },
          {"name": "reward_indexes", "type": {"defined": {"name": "RewardIndexes"}}},
          {"name": "last_updated", "type": "i64"},
          {"name": "last_swap_time", "docs": ["Legacy: timestamp of last swap (can be used for analytics/legacy)"], "type": "i64"},
          {"name": "last_volatility_update", "docs": ["timestamp of last volatility update"], "type": "i64"},
          {"name": "initial_bin_id", "type": "i32"},
          {"name": "active_bin", "type": "i32"},
          {"name": "previous_bin", "type": "i32"},
          {"name": "reference_bin", "type": "i32"},
          {"name": "split_holders_microbps", "type": "u32"},
          {"name": "split_nft_microbps", "type": "u32"},
          {"name": "split_creator_extra_microbps", "type": "u32"},
          {"name": "variable_fee_control", "docs": ["variable_fee_control (C)"], "type": "u32"},
          {"name": "max_volatility_accumulator", "docs": ["cap on va accumulator"], "type": "u32"},
          {"name": "volatility_reference", "docs": ["vr state"], "type": "u32"},
          {"name": "volatility_accumulator", "docs": ["va state"], "type": "u32"},
          {"name": "bin_step_bps", "type": "u16"},
          {"name": "base_fee_bps", "type": "u16"},
          {"name": "creator_cut_bps", "type": "u16"},
          {"name": "legacy_volatility_multiplier_bps", "type": "u16"},
          {"name": "filter_period", "docs": ["seconds"], "type": "u16"},
          {"name": "decay_period", "type": "u16"},
          {"name": "reduction_factor_bps", "docs": ["0..=10000"], "type": "u16"},
          {"name": "max_dynamic_fee_bps", "docs": ["Cap on total fee (base + variable)"], "type": "u16"},
          {"name": "version", "type": "u8"},
          {"name": "bump", "type": "u8"},
          {"name": "pause_bits", "type": "u8"},
          {"name": "accounting_mode", "docs": ["Accounting mode:", "0 = legacy global LP shares", "1 = position-bin shares"], "type": "u8"},
          {"name": "dynamic_fee_enabled", "docs": ["Dynamic fee enabled flag (0 = disabled, 1 = enabled)"], "type": "u8"},
          {"name": "_fee_reserved", "docs": ["Reserved for future parameters (and padding)"], "type": {"array": ["u8", 5]}},
          {"name": "_pad2", "docs": ["Explicit padding to bring total struct size to a multiple of 8"], "type": {"array": ["u8", 2]}}
        ]
      }
    },
    {
      "name": "RewardIndexes",
      "docs": ["Tracks accumulated reward indexes for holders and NFT stakers."],
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"name": "holders_q128", "type": "u128"}, {"name": "nft_q128", "type": "u128"}]}
    }
  ]
}
