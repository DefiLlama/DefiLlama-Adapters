const { sumTokens2 } = require("../helper/unwrapLPs");

const HYBRID_DEBT_MARKET = "0x222222261869bcbfd8c5212b3638898986058a28";

// Supported ERC4626 vault tokens
const VAULTS = [
  "0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E",
  "0x39dE0f00189306062D79eDEC6DcA5bb6bFd108f9",
  "0x2137568666f12fc5A026f5430Ae7194F1C1362aB",
  "0x6072A6d18446278bB5a43eb747de8F61e34cB77f",
  "0xABA9d2D4b6B93C3dc8976D8eb0690CCA56431FE4",
  "0xe91841F707936faf515ff6d478624A325A4f9199",
  "0x6fC9b3a52944A577cd8971Fd8fDE0819001bC595",
  "0x03ef14425CF0d7Af62Cdb8D6E0Acb0b0512aE35C",
];

async function tvl(api) {
  // Get underlying assets for each vault (ERC4626 standard)
  const underlyingAssets = await api.multiCall({
    abi: "address:asset",
    calls: VAULTS,
  });

  // Get vault token balances held in the contract
  const vaultBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: VAULTS.map((vault) => ({ target: vault, params: [HYBRID_DEBT_MARKET] })),
  });

  // Convert vault balances to underlying asset amounts
  const assetAmounts = await api.multiCall({
    abi: "function convertToAssets(uint256) view returns (uint256)",
    calls: VAULTS.map((vault, i) => ({ target: vault, params: [vaultBalances[i]] })),
  });

  // Add converted vault amounts as underlying tokens
  assetAmounts.forEach((amount, i) => {
    if (amount > 0) {
      api.add(underlyingAssets[i], amount);
    }
  });

  // Also sum any underlying tokens held directly in the contract
  return sumTokens2({
    api,
    owner: HYBRID_DEBT_MARKET,
    tokens: underlyingAssets,
  });
}

module.exports = {
  methodology: "TVL is calculated by summing all ERC20 tokens locked in active orders on the HybridDebtMarket contract. Vault shares are converted to their underlying asset value.",
  avax: {
    tvl,
  },
};
