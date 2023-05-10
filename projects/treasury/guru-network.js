const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x167D87A906dA361A10061fe42bbe89451c2EE584";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //usdc
        '0x777172D858dC1599914a1C4c6c9fC48c99a60990',//solid
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//weth
        '0x853d955aCEf822Db058eb8505911ED77F175b99e',//frax
     ],
    owners: [treasury],
    ownTokens: [],
  },
})