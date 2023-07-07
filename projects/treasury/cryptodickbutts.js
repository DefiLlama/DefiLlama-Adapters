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
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0x6d3D490964205c8bC8DeD39e48e88E8Fde45b41f",
        "0x0000000000A39bb272e79075ade125fd351887Ac",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F"
     ],
    owners: [treasury],
    ownTokens: [dick],
    
  },
})