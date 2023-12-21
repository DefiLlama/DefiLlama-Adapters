const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasury = "0xea78912803be5e356eac2b8e127d4ba87230a48e" //

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH
     ],
    owners: [treasury],
  },

})