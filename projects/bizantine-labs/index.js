// Bizantine Labs — USDT0 SuperVault (Flare)
const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

// ERC-4626 SuperVault on Flare. TVL = totalAssets() in the underlying
// (USDT0, 0xe7cd86e13AC4309349F30B3435a9d337750fC82D — read on-chain via asset()).
// All assets are deployed into Mystic/Morpho markets, so summing the vault's
// idle token balances would report $0; totalAssets is the only correct source.
const BIZANTINE_USDT0_VAULT = "0xb7c1c8f7191c7d76b5c6650a6fb20f6f8027bf0d";

module.exports = {
  methodology:
    "TVL is the USDT0 redeemable from the Bizantine USDT0 SuperVault on Flare, read from the vault's ERC-4626 totalAssets().",
  // The vault deposits into Morpho Blue-stack (Mystic) markets on Flare,
  // which DefiLlama already tracks under Morpho Blue.
  doublecounted: true,
  flare: {
    tvl: sumERC4626VaultsExport2({ vaults: [BIZANTINE_USDT0_VAULT] }),
  },
};
