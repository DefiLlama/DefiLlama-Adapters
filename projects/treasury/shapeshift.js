const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const shaTreasury = "0x90A48D5CF7343B08dA12E067680B4C6dbfE551Be";


const FOX = "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',//LUSD
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',//SILO
        ADDRESSES.ethereum.TOKE,//TOKE
     ],
    owners: [shaTreasury],
    ownTokens: [FOX],
  },
})