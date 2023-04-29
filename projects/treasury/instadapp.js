const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0xf81ab897e3940e95d749ff2e1f8d38f9b7cbe3cf";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
        ADDRESSES.optimism.DAI
     ],
    owners: [Treasury],
  },
})