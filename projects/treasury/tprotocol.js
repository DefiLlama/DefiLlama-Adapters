const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x530824DA86689C9C17CdC2871Ff29B058345b44a', //stbt
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //usdc
     ],
    owners: [treasury],
    ownTokens: [],
  },
})