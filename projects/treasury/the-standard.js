const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryARB = "0x99d5D7C8F40Deba9d0075E8Fff2fB13Da787996a";
const treasuryETH = "0xf0A13763a2102A6EA036078C602F154A2a5eEc7A"
const TST = "0xf5A27E55C748bCDdBfeA5477CB9Ae924f0f7fd2e"
const TSTETH = "0xa0b93B9e90aB887E53F9FB8728c009746e989B53"


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0x643b34980E635719C15a2D4ce69571a258F940E9",
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
     ],
    owners: [treasuryARB],
    ownTokens: [TST],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7"
     ],
    owners: [treasuryETH],
    ownTokens: [TSTETH],
  },
})
