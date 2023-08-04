const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasuryARB = "0xf15968a096fc8f47650001585d23bee819b5affb";
const treasuryETH = "0xd884aca1897ac45515cee6d5fd48f341b4023ace"
const hegic = "0x584bC13c7D411c00c01A62e8019472dE68768430"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasuryARB],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC
     ],
    owners: [treasuryETH],
    ownTokens: [hegic],
  },
})