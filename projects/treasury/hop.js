const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: ['0xeea8422a08258e73c139fc32a25e10410c14bd7a'],
    ownTokens: [],
  },
  ethereum: {
    tokens: [ 
     ],
    owners: ['0xeea8422a08258e73c139fc32a25e10410c14bd7a'],
    ownTokens: ['0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc'],
  },
})