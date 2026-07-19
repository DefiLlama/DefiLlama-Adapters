const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = new PublicKey("ETVtC29T7ExxYyWSkpzKPxzrL3SRyrGPRhZe3FwXmFAo");

// Robinhood Chain production deployment (2026-07-15). Each project is an
// independent Launchpad clone that directly holds refundable Paxos USDG.
const RH_FACTORY = "0x032EAfc08388283e94E44Fb0eA26A004D44ba40d";
const RH_USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";

// Anchor account discriminator for LaunchpadState (base58 of the first 8 bytes).
const LAUNCHPAD_DISC = "VgW83Wf4icd";

// Byte offset of the `usdc_vault` Pubkey within LaunchpadState data (incl. 8-byte disc).
const OFF_USDC_VAULT = 80;

async function tvl(api) {
  const connection = getConnection();

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: LAUNCHPAD_DISC } }],
    dataSlice: { offset: OFF_USDC_VAULT, length: 32 },
  });

  // Fundraising/Cancelled hold the full raise, HoldPeriod holds the ~10k refund reserve, Failed holds the
  // refund pool, and Success has ~0 here (its reserve was paid out) — so no per-state filtering is needed
  // and the Raydium pool is never double-counted.
  const usdcVaults = [];
  for (const { account } of accounts) {
    const data = account.data;
    if (data.length < 32) continue;
    const vault = new PublicKey(data);
    if (vault.equals(PublicKey.default)) continue; // vault not initialized yet
    usdcVaults.push(vault.toString());
  }

  await sumTokens2({ api, tokenAccounts: usdcVaults });
}

/**
 * Keep TVL on Robinhood Chain: enumerate every production Launchpad clone from
 * KeepFactoryV4 and sum the canonical USDG held directly by those clones.
 * Fundraising and cancelled launches hold refundable deposits; failure states
 * hold their refund pool. Uniswap V4 pool liquidity is excluded because it is
 * counted by Uniswap and is permanently locked after a successful launch.
 */
async function robinhoodTvl(api) {
  const launchpads = await api.fetchList({
    target: RH_FACTORY,
    lengthAbi: "uint64:nextProjectId",
    itemAbi: "function launchpadOf(uint64) view returns (address)",
  });

  await api.sumTokens({ owners: launchpads, tokens: [RH_USDG] });
}

module.exports = {
  methodology:
    "TVL is the refundable stablecoin held in keep.coffee's own per-launch vaults/contracts: " +
    "USDC vault PDAs on Solana and Paxos USDG held directly by Launchpad clones on Robinhood " +
    "Chain. It covers active raises, post-bootstrap refund reserves, cancelled-raise balances " +
    "and failed-raise refund pools. Liquidity seeded into Raydium or Uniswap V4 is excluded " +
    "because it is counted by those protocols and is permanently locked after success.",
  timetravel: false,
  solana: { tvl },
  robinhood: { tvl: robinhoodTvl },
};
