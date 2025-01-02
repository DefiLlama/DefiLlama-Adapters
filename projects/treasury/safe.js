const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x3EDf6868d7c42863E44072DaEcC16eCA2804Dea1" //
const SAFE = ADDRESSES.ethereum.SAFE
const safe_foundation_treasury = "0x1d4f25bc16b68c50b78e1040bc430a8097fd6f45"
const safe_dao_2 = "0x0b00b3227a5f3df3484f03990a87e02ebad2f888"
const safe_gnosisdao_joint_treasury = "0xd28b432f06cb64692379758B88B5fCDFC4F56922"


module.exports = treasuryExports({
  optimism: {
    tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
     ],
    owners: [treasury],
  },
  ethereum: {
    tokens: [
        nullAddress,
     ],
    owners: [safe_foundation_treasury, safe_dao_2,safe_gnosisdao_joint_treasury],
    ownTokens: [SAFE],
  },

})