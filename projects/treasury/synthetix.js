const ADDRESSES = require('../helper/coreAssets.json');
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const synthetixTreasury = "0x99f4176ee457afedffcb1839c7ab7a030a5e4a92";
const treasury = "0xeb3107117fead7de89cd14d463d340a2e6917769"

const SNX = ADDRESSES.ethereum.SNX;


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.CVX,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.sUSD,
        ADDRESSES.ethereum.LIDO,
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//RAD
        '0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238'
     ],
    owners: [synthetixTreasury, treasury],
    ownTokens: [SNX],
  },
})