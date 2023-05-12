const {  nullAddress,treasuryExports } = require("../helper/treasury");

const synthetixTreasury = "0x99f4176ee457afedffcb1839c7ab7a030a5e4a92";
const treasury = "0xeb3107117fead7de89cd14d463d340a2e6917769"

const SNX = "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',//CVX
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',//sUSD
        '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',//LIDO
        '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',//RAD
        '0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238'
     ],
    owners: [synthetixTreasury, treasury],
    ownTokens: [SNX],
  },
})