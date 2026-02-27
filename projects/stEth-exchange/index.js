const { sumERC4626VaultsExport } = require("../helper/erc4626");
const VAULT = "0xee15D71D8322eA88138c323AddbD0dd123A2dFB2";

module.exports = {
  start: 24540880,
  methodology:
    "TVL is calculated by calling totalAssets() on the stETH Exchange vault, which returns the total ETH in the vault",
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: [VAULT],
      isOG4626: true,
    }),
  },
};