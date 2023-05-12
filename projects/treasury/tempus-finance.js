const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xab40a7e3cef4afb323ce23b6565012ac7c76bfef";
const TEMP = "0xA36FDBBAE3c9d55a1d67EE5821d53B50B63A1aB9"
const LP = "0x514f35a92A13bc7093f299AF5D8ebb1387E42D6B"
const LP2 = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        
     ],
    owners: [treasury],
    ownTokens: [TEMP, LP, LP2],
    resolveLP: true,
  },
})