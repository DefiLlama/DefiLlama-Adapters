const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0xf14d484b29a8ac040feb489afadb4b972422b4e9";
const dick = "0x22BDc8Ad19aE84d9327E81FAD4F5973b91fbaA60"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDT,//TETHER
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.WETH,
        "0x6d3D490964205c8bC8DeD39e48e88E8Fde45b41f",
        "0x0000000000A39bb272e79075ade125fd351887Ac",
        ADDRESSES.ethereum.DAI
     ],
    owners: [treasury],
    ownTokens: [dick],
    
  },
})