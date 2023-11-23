const ADDRESSES = require('../helper/coreAssets.json')
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
        ADDRESSES.arbitrum.USDC_CIRCLE
     ],
    owners: [treasuryARB],
    ownTokens: [TST],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT
     ],
    owners: [treasuryETH],
    ownTokens: [TSTETH],
  },
})
