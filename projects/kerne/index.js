// Created: 2026-01-10
// Kerne Protocol - Delta-Neutral Yield Infrastructure on Base
// https://kerne.ai

const { sumERC4626VaultsExport } = require("../helper/erc4626");

const KERNE_VAULT = "0x5FD0F7eA40984a6a8E9c6f6BDfd297e7dB4448Bd";

module.exports = {
  methodology: "TVL is calculated by calling totalAssets() on the KerneVault ERC-4626 contract, which returns the total WETH held including both on-chain collateral and off-chain hedging positions reported by the protocol strategist.",
  base: {
    tvl: sumERC4626VaultsExport({ 
      vaults: [KERNE_VAULT], 
      isOG4626: true 
    }),
  },
};
