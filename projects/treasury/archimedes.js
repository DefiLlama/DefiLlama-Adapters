const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x29520fd76494Fd155c04Fa7c5532D2B2695D68C6";
const ARCH = "0x73C69d24ad28e2d43D03CBf35F79fE26EBDE1011"



module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.USDT,//usdt
        '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86',//ousd
     ],
    owners: [treasury],
    ownTokens: [ARCH],
  },
})