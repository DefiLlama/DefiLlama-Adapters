const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0B70A2653B6E7BF44A3c80683E9bD9B90489F92A";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.WBTC,//WBTC
     ],
    owners: [treasury],
  },
})