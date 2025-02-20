const { sumERC4626VaultsExport } = require('../helper/erc4626')
const VAULT_ADDRESS = "0x0DC6E8922ac0ECa8287ba22Db14C9Ac9317ed18F"
module.exports = {
  methodology: "Calculates the total amount of ASTR tokens deposited in the ERC4626 vault",
  astar: {
    tvl: sumERC4626VaultsExport({ vaults: [VAULT_ADDRESS], isOG4626: true}),
  },
}
