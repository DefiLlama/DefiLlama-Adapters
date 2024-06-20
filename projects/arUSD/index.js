const { sumERC4626VaultsExport } = require("../helper/erc4626");

const treasuries = ["0x07D1718fF05a8C53C8F05aDAEd57C0d672945f9a"];

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({
      vaults: treasuries,
      tokenAbi: "asset",
      balanceAbi: "totalAssets",
    }),
  },
};
