const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc28f68cd2df0fcc50f0058fb20abbc77bec8bdc6";
const operations = "0x2157bfbb446744fc92bd95c3911eb58d0a9b01bd";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury, operations],
  },
  base: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury, operations],
  },
  blast: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury, operations],
  },
})
