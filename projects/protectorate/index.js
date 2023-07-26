const { sumERC4626VaultsExport } = require("../helper/erc4626");

module.exports = {
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults: ["0xaF53431488E871D103baA0280b6360998F0F9926"], }),
  },
}