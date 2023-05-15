const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0xeCa31b3cbD0C65CC3Ea2DE2338693B74445B0c2C";



module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.WETH,//weth
     ],
    owners: [Treasury],
  },
})