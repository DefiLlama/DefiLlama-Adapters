const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

const VAULT = "0xd0Ee0CF300DFB598270cd7F4D0c6E0D8F6e13f29";

module.exports = {
  hyperliquid: {
    tvl: sumERC4626VaultsExport2({ vaults: [VAULT], }),
  },
}
