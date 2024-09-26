const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0x48229e5D82a186Aa89a99212D2D59f5674aa5b6C";

module.exports = treasuryExports({
  rsk: {
    tokens: [
      // Rootstock Assets
      nullAddress,
      "0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5", // RIF      
    ],
    owners: [treasury]
  },
});
