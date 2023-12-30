const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const shaTreasury = "0x90A48D5CF7343B08dA12E067680B4C6dbfE551Be";

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
})