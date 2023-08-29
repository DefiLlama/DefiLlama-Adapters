const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x7fca3bf8adc4e143bd789aecda36c0ce34f1d75b";

const LION = "0x8eBb85D53e6955e557b7c53acDE1D42fD68561Ec";


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244",
     ],
    owners: [Treasury],
    ownTokens: [LION],
    resolveUniV3: true,
  },
})