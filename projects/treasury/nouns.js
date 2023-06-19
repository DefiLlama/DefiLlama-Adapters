const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0BC3807Ec262cB779b38D65b38158acC3bfedE10";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, //USDC
        ADDRESSES.ethereum.STETH,//stETH
     ],
    owners: [treasury,],
  },
})