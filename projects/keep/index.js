// projects/keep/index.js  —  DeFiLlama-Adapters TVL adapter for Keep
// Keep: a refundable token launchpad on Solana.  https://keep.coffee
//
// Program (mainnet): ETVtC29T7ExxYyWSkpzKPxzrL3SRyrGPRhZe3FwXmFAo
//
// TVL = the refundable USDC that Keep holds in its OWN per-launch program vaults.
// Backers deposit USDC into each launch's `usdc_vault` (a launchpad-PDA-owned SPL
// account). That USDC is withdrawable (refunds on cancel/failure, reserve during
// hold periods) => it is Keep's TVL. Liquidity Keep seeds into a Raydium pool is
// NOT counted (it becomes Raydium's TVL, and Keep burns 100% of the LP, so it is
// permanently non-withdrawable — it can never be Keep's TVL).
//
// Verified against 6 live mainnet accounts on 2026-07-12:
//   - discriminator "VgW83Wf4icd" (sha256("account:LaunchpadState")[..8], hex ab79111c0fe38dce)
//   - usdc_vault pubkey at byte offset 80; each is a real USDC-mint SPL token account
//   - reported TVL matched Σ of live usdc_vault balances

const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = new PublicKey("ETVtC29T7ExxYyWSkpzKPxzrL3SRyrGPRhZe3FwXmFAo");

// Anchor account discriminator for LaunchpadState (base58 of the first 8 bytes).
const LAUNCHPAD_DISC = "VgW83Wf4icd";

// Byte offset of the `usdc_vault` Pubkey within LaunchpadState data (incl. 8-byte disc).
const OFF_USDC_VAULT = 80;

async function tvl(api) {
  const connection = getConnection();

  // Enumerate every launch by DISCRIMINATOR ONLY. Do not gate on dataSize: the
  // LaunchpadState struct has grown across program versions, so a size filter would
  // silently drop launches created under an earlier (shorter) layout.
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: LAUNCHPAD_DISC } }],
  });

  // Collect each launch's own USDC vault. Summing usdc_vault across ALL states is
  // correct and self-disjoint: Fundraising/Cancelled hold the full raise, HoldPeriod
  // holds the ~10k refund reserve, Failed holds the refund pool, and Success has ~0
  // here (its reserve was paid out) — so no per-state filtering is needed and the
  // Raydium pool is never double-counted.
  const usdcVaults = [];
  for (const { account } of accounts) {
    const data = account.data;
    if (data.length < OFF_USDC_VAULT + 32) continue; // defensive vs legacy layouts
    const vault = new PublicKey(data.subarray(OFF_USDC_VAULT, OFF_USDC_VAULT + 32));
    if (vault.equals(PublicKey.default)) continue; // vault not initialized yet
    usdcVaults.push(vault.toString());
  }

  // One batched read; each vault holds USDC, so balances key by the USDC mint.
  await sumTokens2({ api, tokenAccounts: usdcVaults });
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is the total refundable USDC held in Keep's own per-launch program vaults " +
    "(the usdc_vault PDA of each LaunchpadState account, enumerated via getProgramAccounts " +
    "on the Keep program). It covers escrowed USDC in active raises, post-bootstrap refund " +
    "reserves, cancelled-raise balances and failed-raise refund pools — all withdrawable by " +
    "depositors. Liquidity Keep seeds into Raydium is excluded (that is Raydium's TVL), and " +
    "Keep burns 100% of that LP, so it is not withdrawable and is never counted here.",
  isHeavyProtocol: true, // large getProgramAccounts + multi-account fan-out
  timetravel: false,     // current-only on-chain read; no historical backfill source
  solana: { tvl },
};
