const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x167D87A906dA361A10061fe42bbe89451c2EE584";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //usdc
        '0x777172D858dC1599914a1C4c6c9fC48c99a60990',//solid
        ADDRESSES.ethereum.WETH,//weth
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',//frax
     ],
    owners: [treasury],
    ownTokens: [],
  },
})