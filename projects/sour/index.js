const { sumTokens2 } = require("../helper/solana");
const ADDRESSES = require('../helper/coreAssets.json')

// Sour LP vault PDA — derived deterministically from the program ID:
//   findProgramAddressSync([utf8('sour_vault')], 'souryQgnM1xiNuGcmVYLPGT3MKqnGN8QTqP8zk8eape')
//   → 'F6aMk3z9TVEuGJ2DQ7uBFrDwJUK88gBxVLnXMSZraGD' (bump 254)
//
// The vault holds the LP-side USDC that backs trader PnL on Sour. Trader
// collateral is custodied per-trader inside the program but is not counted
// toward protocol TVL by convention (it's user funds, not LP funds), so
// `sumTokens2` aggregating only the vault's token accounts is the correct
// scope.
const SOUR_VAULT_PDA = 'F6aMk3z9TVEuGJ2DQ7uBFrDwJUK88gBxVLnXMSZraGD';

async function tvl() {
  return sumTokens2({ owner: SOUR_VAULT_PDA, tokens: [ADDRESSES.solana.USDC] });
}

module.exports = {
  hallmarks: [
    ['2026-05-06', 'launch Sour mainnet v1.0.0'],
  ],
  timetravel: false,
  methodology:
    "TVL is the USDC balance of the SOUR LP vault — a program-derived account holding LP collateral for the Solana perpetuals program at souryQgnM1xiNuGcmVYLPGT3MKqnGN8QTqP8zk8eape. Vault PDA derived from [utf8('sour_vault'), program_id]. Trader collateral is excluded.",
  solana: {
    tvl,
  },
};
