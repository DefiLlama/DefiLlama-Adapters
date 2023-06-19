const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xab40a7e3cef4afb323ce23b6565012ac7c76bfef";
const TEMP = "0xA36FDBBAE3c9d55a1d67EE5821d53B50B63A1aB9"
const LP = "0x514f35a92A13bc7093f299AF5D8ebb1387E42D6B"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.STETH,
        
     ],
    owners: [treasury, LP],
    ownTokens: [TEMP],
    resolveLP: true,
    resolveUniV3: true,
  },
})