const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

module.exports = {
  methodology: "TVL is the sum of assets across all stash.fun ERC-4626 vaults on HyperEVM. Each vault holds USDC and trades perpetual futures (stocks, crypto, commodities, forex, indices) on Hyperliquid.",
  hyperliquid: {
    tvl: sumERC4626VaultsExport2({
      vaults: [
        "0x8F6034Fe423f696DB08fB8C536B88D9B9389dE34", // Metals Vault (GOLD, SILVER, PLATINUM)
        "0xfE937fED2219D06e2BAD986933ea96065D8BE177", // Energy Vault (OIL, NATGAS)
        "0xe626CFC0395719D59dA210270051a9A03C210bdd", // Broad Vault (GOLD, SILVER, OIL, NATGAS, PLATINUM)
      ],
    }),
  },
};