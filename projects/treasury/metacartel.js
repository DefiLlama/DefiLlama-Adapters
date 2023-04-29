const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4570b4fAF71E23942B8B9F934b47ccEdF7540162";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.WETH,//weth
        ADDRESSES.ethereum.USDC,//usdc
        '0x6243d8CEA23066d098a15582d81a598b4e8391F4',//flx
        ADDRESSES.ethereum.DAI,//dai
        '0xfb5453340C03db5aDe474b27E68B6a9c6b2823Eb',//robot
        '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',//rai
     ],
    owners: [treasury]
  },
})