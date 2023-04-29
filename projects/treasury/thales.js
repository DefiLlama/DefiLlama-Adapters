const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x2902E381c9Caacd17d25a2e008db0a9a4687FDBF";

const THALE = "0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30";


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244"
     ],
    owners: [Treasury],
    ownTokens: [THALE],
  },
})