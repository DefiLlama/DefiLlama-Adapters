const { sumTokens2 } = require("../helper/solana");
const ADDRESSES = require("../helper/coreAssets.json");

// Oro protocol vault owner (Price PDA)
const VAULT_OWNER = "HKMT2i4kGzktb4AVo4fKkHK4AmpxVyvGEAfotVX3tML4";

// Token mints
const GOLD_MINT = "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A";

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [GOLD_MINT, VAULT_OWNER],
      [ADDRESSES.solana.USDC, VAULT_OWNER],
    ],
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is calculated by summing the GOLD and USDC balances held in the Oro protocol vaults.",
  solana: { tvl },
};
