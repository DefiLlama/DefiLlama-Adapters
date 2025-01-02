const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x530824DA86689C9C17CdC2871Ff29B058345b44a', //stbt
        ADDRESSES.ethereum.USDC, //usdc
     ],
    owners: [treasury],
    ownTokens: [],
  },
})