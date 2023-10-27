const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x3c0d3f52e9aa1c9645a05452f45c064a0f9569bf";
const ePMX = "0xdc6d1bd104e1efa4a1bf0bbcf6e0bd093614e31a"

module.exports = treasuryExports({
  polygon: {
    owners: [treasury],
    ownTokens: [ePMX],
  },
});