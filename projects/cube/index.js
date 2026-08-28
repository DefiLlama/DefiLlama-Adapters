const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getAssociatedTokenAddress } = require("../helper/solana");

// Cube DEX pool program (Solana mainnet). The on-chain Rust module is
// named `cubic_pool` (legacy name from before the protocol rebrand to Cube).
// Source of truth: sdk/src/config/networks.ts in cubee.ee/sdk.
const PROGRAM_ID = "8iQtGj9mcUfFUGaiCpPy89swC3s8YTC8FhVZWfgeZhwu";

// CubicPool account anchor discriminator (first 8 bytes of the account
// data). Hardcoded so we don't ship the full IDL alongside the adapter.
const CUBIC_POOL_DISCRIMINATOR_B64 = Buffer.from([137, 210, 42, 22, 209, 156, 43, 78]).toString("base64");

// Pool sizes: v3 is the pre-migration shape; v4 reorganises per-token data
// from parallel arrays into [TokenSlot; 10]. Both shapes coexist on-chain
// until every legacy pool runs `migrate_pool_v4`, so the adapter handles
// both. Sizes include the 8-byte discriminator.
const POOL_V3_LEN = 1154;
const POOL_V4_LEN = 1683;

// v3 layout (offsets after the 8-byte discriminator):
//   8  config: pubkey
//   40 bump: u8
//   41 token_count: u8                ← here
//   42 pool_id: u64
//   50 token_mints: pubkey[10]        ← here
//   370 token_programs: pubkey[10]    ← here
//   ...
//   1024 pool_enabled: bool           ← here
const V3_TOKEN_COUNT_OFFSET = 41;
const V3_TOKEN_MINTS_OFFSET = 50;
const V3_TOKEN_PROGRAMS_OFFSET = 370;
const V3_POOL_ENABLED_OFFSET = 1024;

// v4 layout (offsets after the 8-byte discriminator):
//   8  config (32) + bump (1)
//   41 token_count: u8                ← here
//   42 pool_id (8) + swap_fee_rate (4) + protocol_fee_rate (2) + created_at (8)
//   64 pool_enabled: bool             ← here
//   65 swaps_enabled (1) + pool_admin (32) + pending_pool_admin (32) +
//      range_manager (32) + range_manager_enabled (1) +
//      range_manager_max_vb_change_bps (2) +
//      range_manager_max_weight_change_bps (2) +
//      range_manager_min_update_interval_secs (4) +
//      range_manager_last_updated (8)
//   179 tokens: TokenSlot[10]         ← here; each slot = AssetConfig (88) + AssetDynamics (56) = 144 bytes
//     AssetConfig.mint = slot+0 .. slot+32
//     AssetConfig.token_program = slot+32 .. slot+64
const V4_TOKEN_COUNT_OFFSET = 41;
const V4_POOL_ENABLED_OFFSET = 64;
const V4_TOKENS_OFFSET = 179;
const V4_TOKEN_SLOT_LEN = 144;

function parsePool(data) {
  const len = data.length;
  if (len === POOL_V3_LEN) {
    const tokenCount = data.readUInt8(V3_TOKEN_COUNT_OFFSET);
    const poolEnabled = data.readUInt8(V3_POOL_ENABLED_OFFSET) !== 0;
    const tokenMints = [];
    const tokenPrograms = [];
    for (let i = 0; i < tokenCount; i++) {
      tokenMints.push(new PublicKey(data.slice(V3_TOKEN_MINTS_OFFSET + i * 32, V3_TOKEN_MINTS_OFFSET + (i + 1) * 32)));
      tokenPrograms.push(new PublicKey(data.slice(V3_TOKEN_PROGRAMS_OFFSET + i * 32, V3_TOKEN_PROGRAMS_OFFSET + (i + 1) * 32)));
    }
    return { tokenCount, poolEnabled, tokenMints, tokenPrograms };
  }
  if (len === POOL_V4_LEN) {
    const tokenCount = data.readUInt8(V4_TOKEN_COUNT_OFFSET);
    const poolEnabled = data.readUInt8(V4_POOL_ENABLED_OFFSET) !== 0;
    const tokenMints = [];
    const tokenPrograms = [];
    for (let i = 0; i < tokenCount; i++) {
      const slotOff = V4_TOKENS_OFFSET + i * V4_TOKEN_SLOT_LEN;
      tokenMints.push(new PublicKey(data.slice(slotOff, slotOff + 32)));
      tokenPrograms.push(new PublicKey(data.slice(slotOff + 32, slotOff + 64)));
    }
    return { tokenCount, poolEnabled, tokenMints, tokenPrograms };
  }
  return null;
}

async function tvl(api) {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ memcmp: { offset: 0, bytes: CUBIC_POOL_DISCRIMINATOR_B64, encoding: "base64" } }],
  });

  const tokenAccounts = [];
  for (const { pubkey, account } of accounts) {
    const parsed = parsePool(account.data);
    if (!parsed || !parsed.poolEnabled) continue;
    for (let i = 0; i < parsed.tokenCount; i++) {
      tokenAccounts.push(getAssociatedTokenAddress(parsed.tokenMints[i], pubkey, parsed.tokenPrograms[i]));
    }
  }

  return sumTokens2({ tokenAccounts, api, allowError: true });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of USD value of all tokens locked in Cube weighted pools. Reads every CubicPool account from the Cube program (handling both legacy and v4 layouts that coexist during migration) and sums balances of each pool's token vaults (derived as ATA(pool, mint, token_program)).",
  solana: {
    tvl,
  },
};
