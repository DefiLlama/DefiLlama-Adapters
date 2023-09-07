const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress } = require('../helper/tokenMapping');
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [
      "0x842618c3f6E3E12edc5F02CC17561293e10CEb7d",
    ],
    ownTokens: ["0x1F1F26C966F483997728bEd0F9814938b2B5E294"],
  },
})