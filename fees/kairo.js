// Kairo — Fees & Revenue adapter for DefiLlama.
//
// Submit this as `fees/kairo.js` in https://github.com/DefiLlama/DefiLlama-Adapters
// (open a PR there; this copy in the Kairo repo is the source of truth).
//
// Kairo has no TVL — it's a Proof-of-Activity mined SPL token. Its real,
// on-chain economic activity is FEES: SOL that miners pay to the program.
// Those fees fund a buyback-and-burn flywheel.
//
// Per-day fee figures (in SOL) come from the Kairo scorer, which derives them
// directly from the treasury's on-chain transaction history:
//   GET https://score.kairo.win/defillama/fees?day=YYYY-MM-DD
//   -> { day, feesSol, revenueSol }

const fetchURL = require("../utils/fetchURL"); // axios-style: returns { data }

const KAIRO_FEES_API = "https://score.kairo.win/defillama/fees";

const methodology = {
  Fees: "SOL paid by miners to the Kairo program: 0.1 SOL to initialize a miner plus 0.02 SOL per hashrate top-off.",
  Revenue:
    "Half of collected fees fund protocol operations; the other half is used to buy back and burn $KAIRO on the open market.",
  ProtocolRevenue: "The operations half of mining fees.",
  HoldersRevenue:
    "The buyback-and-burn half of mining fees — value returned to $KAIRO holders by permanently reducing supply.",
};

async function fetch(_t, _b, options) {
  const day = new Date(options.startOfDay * 1000).toISOString().slice(0, 10);
  const { data } = await fetchURL(`${KAIRO_FEES_API}?day=${day}`);
  const feesSol = Number(data && data.feesSol) || 0;
  const revenueSol = Number(data && data.revenueSol) || 0; // operations half

  const dailyFees = options.createBalances();
  const dailyRevenue = options.createBalances();
  const dailyHoldersRevenue = options.createBalances();

  // Amounts are in SOL; DefiLlama prices the coingecko 'solana' token at the
  // right historical timestamp for the day being processed.
  dailyFees.addCGToken("solana", feesSol);
  dailyRevenue.addCGToken("solana", revenueSol);
  dailyHoldersRevenue.addCGToken("solana", Math.max(0, feesSol - revenueSol));

  return { dailyFees, dailyRevenue, dailyProtocolRevenue: dailyRevenue, dailyHoldersRevenue };
}

module.exports = {
  version: 2,
  methodology,
  adapter: {
    solana: {
      fetch,
      start: "2026-05-31", // Kairo mainnet launch (UTC)
    },
  },
};
