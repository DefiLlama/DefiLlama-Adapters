const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x3EDf6868d7c42863E44072DaEcC16eCA2804Dea1" //

module.exports = treasuryExports({
  optimism: {
    tokens: [
        nullAddress,
        ADDRESSES.optimism.OP,
     ],
    owners: [treasury],
  },

})