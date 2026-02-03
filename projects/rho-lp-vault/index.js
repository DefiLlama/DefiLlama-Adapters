const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

const VAULT = "0x4cb280e63251b9ab24a54def74bf5995d82ff398";

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport2({ vaults: [VAULT], }),
  },
}
