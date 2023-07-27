const {  nullAddress,treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json');

const GNS = "0x18c11FD286C5EC11c3b683Caa813B77f5163A122"
const multisig = "0xf8e93a7d954f7d31d5fa54bc0eb0e384412a158d"
const treasury = "0x80fd0accC8Da81b0852d2Dca17b5DDab68f22253"
const gnspolygon = "0xE5417Af564e4bFDA1c483642db72007871397896"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.DAI,
        "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418",
     ],
    owners: [multisig, treasury],
    ownTokens: [GNS],
    resolveUniV3: true,
  },
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.USDT,
     ],
    owners: [treasury],
    ownTokens: [gnspolygon],
    resolveUniV3: true,
  },
})