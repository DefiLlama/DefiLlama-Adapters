const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

module.exports = {
  methodology: "TVL is the sum of totalAssets() across all live CrystalClear ERC-4626 vaults on HyperEVM. Each vault holds USDC and trades perpetuals on Hyperliquid via a delegated agent.",
  hyperliquid: {
    tvl: sumERC4626VaultsExport2({
      vaults: [
        "0x231f66c336512e897855420a2788B83e164C6Adf", // Onyx
        "0x1b463561f264114F9D4db6FF9eE2771B33076B13", // Amber
        "0xb44169e66C898FF70029f9CF2fdB9685d7bC99c6", // Ruby
        "0x015A70185a80D8C8c034e3d360E25A14c7FB8cF0", // Moonstone
        "0x1efAE1f600947cA5dc0E87AA18657f36c559A40b", // Emerald
        "0x2D7ACD39B634B50Cd37883FE374E1f430e27Ea50", // Peridot
        "0x6B88f2975B784531DB1159D37CFf9f1629e93fa8", // Sapphire
        "0x89C08a6F468CA5AF65E7D48bC091E5c4025b42C2", // Opal
      ],
    }),
  },
};
