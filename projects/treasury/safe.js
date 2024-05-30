const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x3EDf6868d7c42863E44072DaEcC16eCA2804Dea1" //
const SAFE = "0x5afe3855358e112b5647b952709e6165e1c1eeee"
const safe_foundation_treasury = "0x1d4f25bc16b68c50b78e1040bc430a8097fd6f45"
const safe_dao_2 = "0x0b00b3227a5f3df3484f03990a87e02ebad2f888"


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
    owners: [safe_foundation_treasury, safe_dao_2],
    ownTokens: [SAFE],
  },

})