const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0xb966b7038A2b42A0419457dA4F4d2FBa23097aE1";
const LSD = "0xfAC77A24E52B463bA9857d6b758ba41aE20e31FF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [Treasury],
    ownTokens: [LSD],
  },
})