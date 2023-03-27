const {  nullAddress,treasuryExports } = require("../helper/treasury");

const rarTreasury = "0xFDfF6b56CcE39482032b27140252FF4F16432785";
const rarTreasury1 = "0x1cf0dF2A5A20Cd61d68d4489eEBbf85b8d39e18a";

const RARI = "0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
     ],
    owners: [rarTreasury, rarTreasury1],
    ownTokens: [RARI],
  },
})