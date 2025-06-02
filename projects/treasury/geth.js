const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x21539334f45Ac41Bd10789942b744a18a4775d6d" //

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH
     ],
    owners: [treasury],
  },

})