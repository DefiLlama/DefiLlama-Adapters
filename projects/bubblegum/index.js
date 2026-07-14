const { getProvider, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { getConfig } = require("../helper/cache");
const bs58 = require("bs58").default || require("bs58");

// Bubblegum — pump.fun-style launchpad for prediction markets on Solana.
// Two programs, two axes of state:
//   - curve: a bonding curve per market that mints $TICKER and escrows BUYER SOL
//   - cpmm:  a YES/NO prediction market whose COLLATERAL IS $TICKER (not SOL)
//
// The only REAL external asset in the system is the SOL paid into the markets.
// $TICKER is a protocol-minted token whose sole backing/price is that same SOL,
// so counting $TICKER balances (curve token vault, CPMM collateral, or the
// $TICKER side of a graduated pool) would be circular double-counting. We count
// ONLY native SOL, in the two places it is actually escrowed:
//
//   LEG 1 — pre-graduation bonding curves (on-chain). Each market's sol_vault
//           PDA holds buyer SOL until the curve graduates.
//   LEG 2 — graduated markets' Meteora DAMM v2 pools (on-chain). At graduation
//           the curve's SOL migrates into a PERMANENTLY-LOCKED Meteora pool
//           (paired with 150M $TICKER). That SOL is still protocol-locked value
//           but the curve's sol_vault is now empty, so leg 1 alone misses it.
//           The BondingCurve account doesn't store the pool address, so we get
//           each pool's WSOL vault token-account from the protocol indexer and
//           read the balance on-chain here (address discovery off-chain, value
//           on-chain).
//
// Live mainnet curve program: the `declare_id!` baked into the deployed contract
// (contracts/curve/programs/bubblegum-curve/src/lib.rs), matched by the production
// indexer config and confirmed on-chain (it holds the live BondingCurve accounts).
// NOTE: the repo's addresses/mainnet.json registry and the npm SDK are STALE here —
// they still list a superseded first-deploy program (6eLrwpk…) that holds zero markets.
const CURVE_PROGRAM = new PublicKey("71ywu6cFWETLyiz1KcuMwq2wfguYfra7b1bCPinVqKm3");

// Protocol indexer — read-only aggregate endpoint. Returns the graduated pools'
// WSOL vault token-accounts (`meteoraSolVaults`) for leg 2. If it is unreachable
// we degrade to leg-1-only rather than fail the whole adapter.
const INDEXER_TVL = "https://bgum-mainnet-indexer-production.up.railway.app/defillama/tvl";

// Anchor 8-byte account discriminator for the `BondingCurve` account.
const BONDING_CURVE_DISCRIMINATOR = Buffer.from([23, 183, 248, 55, 96, 216, 172, 96]);

// Byte offsets inside BondingCurve account data (Borsh, fixed-size prefix).
// Layout: 8 disc | 32 condition_id | 8 nonce | 32 creator | 32 ticker_mint |
//         32 token_vault | 32 sol_vault | 32 cpmm_market | 8 real_sol_collected | ...
const OFFSET_SOL_VAULT = 144; // pubkey(32): native-SOL escrow PDA for this curve
const OFFSET_STATUS = 248;    // u8 enum CurveStatus: 0=Active 1=GraduationPending 2=Graduated

async function tvl(api) {
  const conn = getProvider().connection;

  // ── LEG 1: pre-graduation curve escrow (on-chain) ────────────────────────
  // Fetch every BondingCurve account (discriminator filter keeps it to this one
  // account type). We read each curve's status + its sol_vault PDA address.
  const accounts = await conn.getProgramAccounts(CURVE_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(BONDING_CURVE_DISCRIMINATOR) } }],
  });

  const solOwners = [];
  for (const { account } of accounts) {
    const data = account.data;
    const status = data[OFFSET_STATUS];
    // status 2 (Graduated) => SOL has migrated to Meteora; counted in leg 2 below.
    // Keep Active (0) and GraduationPending (1) — their sol_vault still holds SOL.
    if (status !== 0 && status !== 1) continue;
    solOwners.push(new PublicKey(data.slice(OFFSET_SOL_VAULT, OFFSET_SOL_VAULT + 32)).toBase58());
  }

  // ── LEG 2: graduated Meteora pools' SOL reserve (on-chain balances) ───────
  // Address discovery via the indexer; balances read on-chain by sumTokens2.
  let tokenAccounts = [];
  try {
    const res = await getConfig("bubblegum/tvl", INDEXER_TVL);
    tokenAccounts = Array.isArray(res && res.meteoraSolVaults) ? res.meteoraSolVaults : [];
  } catch (e) {
    // Indexer unreachable — degrade to curve-only TVL. History already recorded
    // by DefiLlama is unaffected; only this refresh loses the graduated leg.
  }

  // sumTokens2 prices native SOL (solOwners) and the WSOL token-accounts
  // (tokenAccounts) both as SOL, summed into `api`.
  return sumTokens2({ api, solOwners, tokenAccounts });
}

module.exports = {
  timetravel: false, // state-based: getProgramAccounts only reflects the current slot
  methodology:
    "TVL is the native SOL held by the protocol, in the two places it is escrowed. " +
    "(1) Pre-graduation bonding curves: the curve program (71ywu6cFWETLyiz1KcuMwq2wfguYfra7b1bCPinVqKm3) holds one BondingCurve per market; we enumerate them and sum the lamports in each Active/GraduationPending curve's sol_vault escrow PDA (read on-chain). " +
    "(2) Graduated markets: at graduation the curve's SOL migrates into a permanently-locked Meteora DAMM v2 pool, so we also sum the SOL (WSOL) reserve of each graduated pool, read on-chain from its vault token-account. " +
    "Excluded to avoid circular double-counting: the curve's virtual reserves (a pricing device, not real assets) and all protocol-minted $TICKER (the curve token vault, the CPMM collateral, and the $TICKER side of graduated pools) — $TICKER's only backing is the SOL already counted here.",
  solana: {
    tvl,
  },
};
