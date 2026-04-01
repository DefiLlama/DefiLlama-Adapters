const { sumTokensExport } = require("../helper/unwrapLPs");

// Europa Tech — EU-regulated fractional real estate investment platform
// Website: https://europa-tech.org
// Chain: Base mainnet (chainId: 8453)
// Regulation: CONSOB (Italy), MiCA compliant

// EURT — EUR-pegged ERC-20 stablecoin (1 EURT = 1 EUR)
const EURT = "0xF0ff21C0a3De78a4503A77340079f3d4dad3d373";

// Contracts holding investor EURT
const YIELD_VAULT = "0x63468cBe53E31c469412B8E2769284e87259e82b"; // ERC-4626 vault
const P2P_ESCROW = "0xb629238600BE56Dc9d05f224DA4AEe1Dd44d0A7d";  // P2P secondary market escrow

module.exports = {
  methodology:
    "TVL is the total EURT (EUR-pegged stablecoin) held in the YieldVault and P2P escrow contracts, representing active investor capital on the Europa Tech fractional real estate platform.",
  base: {
    tvl: sumTokensExport({
      owners: [YIELD_VAULT, P2P_ESCROW],
      tokens: [EURT],
    }),
  },
};
