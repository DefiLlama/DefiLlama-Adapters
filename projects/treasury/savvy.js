const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4f54cab19b61138e3c622a0bd671c687481ec030";
const SVY = "0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034"
module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.WETH,
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
     ],
    owners: [treasury,],
    ownTokens: [SVY],
  },
})