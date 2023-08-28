const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x015ed76723aaf0ef9960dd66631d2ecac77e4156";
const treasury2 = "0xabfd88db78d2503af372cb9c21cdc2f181232b4f"
const treasury3 = "0xdd92eb1478d3189707ab7f4a5ace3a615cdd0476"

const PNT = "0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury, treasury2, treasury3],
    ownTokens: [PNT],
  },
})