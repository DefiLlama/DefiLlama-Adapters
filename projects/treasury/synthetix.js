const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const synthetixTreasury = "0x99f4176ee457afedffcb1839c7ab7a030a5e4a92";
const treasury = "0xeb3107117fead7de89cd14d463d340a2e6917769"

const SNX = ADDRESSES.ethereum.SNX;


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',//CVX
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',//sUSD
        ADDRESSES.ethereum.LIDO,//LIDO
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//RAD
        '0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238'
     ],
    owners: [synthetixTreasury, treasury],
    ownTokens: [SNX],
  },
})