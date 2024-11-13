const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const rarTreasury = "0xFDfF6b56CcE39482032b27140252FF4F16432785";
const rarTreasury1 = "0x1cf0dF2A5A20Cd61d68d4489eEBbf85b8d39e18a";

const RARI = "0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
     ],
    owners: [rarTreasury, rarTreasury1],
    ownTokens: [RARI],
  },
})