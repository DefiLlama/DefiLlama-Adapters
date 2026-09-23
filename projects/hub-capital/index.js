// Curator-specific Lagoon vaults. Values are read from vault contracts, never from the Lagoon API.
const vaults = {
  ethereum: [
    "0xca790385506b790554571cbc9da73f0130cdcfd5", // Hub Capital USDC vault
  ],
};

module.exports = {
  doublecounted: true,
  methodology: "Counts on-chain totalAssets, denominated in USDC, of the Lagoon vault managed by Hub Capital. This curator TVL overlaps with Lagoon.",
};

for (const [chain, calls] of Object.entries(vaults)) {
  module.exports[chain] = {
    tvl: (api) => api.erc4626Sum2({ calls }),
  };
}
