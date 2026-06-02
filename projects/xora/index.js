const { sumTokensExport } = require('../helper/sumTokens');

// XORA — XRP Ledger neobank
// Treasury TVL is the XRP balance of the canonical custodial treasury account.
// User deposits route via destination tags into this single shared account;
// per-user accounting is internal to XORA. The on-chain balance is the
// canonical TVL number.
const TREASURY_ADDRESSES = [
  "rhbErkS2d4H82tRbdGyFkhhc4LNtjKaC3o",
];

module.exports = {
  methodology:
    "Sums the XRP balance held in the XORA treasury account " +
    "rhbErkS2d4H82tRbdGyFkhhc4LNtjKaC3o on the XRP Ledger. The treasury is " +
    "a single shared custody wallet; user deposits route to it via " +
    "destination tags. Per-user accounting is internal to XORA; the on-chain " +
    "balance is the canonical TVL.",
  start: 1772841600, // 2026-03-07 (treasury first deposit)
  ripple: {
    tvl: sumTokensExport({ owners: TREASURY_ADDRESSES }),
  },
};
