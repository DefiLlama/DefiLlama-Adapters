const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const bitdaoTreasury1 = "0x78605Df79524164911C144801f41e9811B7DB73D";

const BIT = "0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5";

const LP = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9',//FTT
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',//xSUSHI
        "0x52A8845DF664D76C69d2EEa607CD793565aF42B8",
     ],
    owners: [bitdaoTreasury1],
    ownTokens: [BIT, LP],
    resolveLP: true,
    resolveUniV3: true,
  },
})