const {  nullAddress,treasuryExports } = require("../helper/treasury");

const bitdaoTreasury1 = "0x78605Df79524164911C144801f41e9811B7DB73D";

const BIT = "0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9',//FTT
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',//xSUSHI
     ],
    owners: [bitdaoTreasury1],
    ownTokens: [BIT],
  },
})