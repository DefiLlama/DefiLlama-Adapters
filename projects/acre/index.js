const { sumERC4626VaultsExport } = require("../helper/erc4626");

module.exports = {
  start: 1757707931,
  doublecounted: true,
  methodology:
    "TVL is calculated by calling totalAssets() on the acreBTC ERC-4626 vault, which returns the total tBTC backing all acreBTC shares.",
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: ["0x19531C886339dd28b9923d903F6B235C45396ded"],
      isOG4626: true,
    }),
  },
};
