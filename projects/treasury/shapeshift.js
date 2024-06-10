const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const shaTreasury = "0x90A48D5CF7343B08dA12E067680B4C6dbfE551Be";
const safeOptimism = "0x6268d07327f4fb7380732dc6d63d95F88c0E083b"; 

const safeAvalanche = "0x74d63F31C2335b5b3BA7ad2812357672b2624cEd" ;

const safePolygon = "0xB5F944600785724e31Edb90F9DFa16dBF01Af000" ;

const safeGnosis = "0xb0E3175341794D1dc8E5F02a02F9D26989EbedB3" ;

const safeBSC = "0x8b92b1698b57bEDF2142297e9397875ADBb2297E" ;

const safeArbitrum = "0x38276553F8fbf2A027D901F8be45f00373d8Dd48" ;

const LP = "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c"
const FOX = "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d";
const tFOX = "0x808D3E6b23516967ceAE4f17a5F9038383ED5311"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.LUSD,//LUSD
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',//SILO
        ADDRESSES.ethereum.TOKE,//TOKE
     ],
    owners: [shaTreasury],
    ownTokens: [FOX, LP, tFOX],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safeArbitrum],
    ownTokens: [],
  },
  bsc: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safeBSC],
    ownTokens: [],
  },
  xdai: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safeGnosis],
    ownTokens: ["0x21a42669643f45Bc0e086b8Fc2ed70c23D67509d"],
  },
  polygon: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safePolygon],
    ownTokens: [],
  },
  avax: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safeAvalanche],
    ownTokens: [],
  },
  optimism: {
    tokens: [ 
        nullAddress,
     ],
    owners: [safeOptimism],
    ownTokens: ["0xF1a0DA3367BC7aa04F8D94BA57B862ff37CeD174"],
  },
})