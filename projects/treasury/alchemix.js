const {  nullAddress,treasuryExports } = require("../helper/treasury");

const alchemixTreasury = "0x8392F6669292fA56123F71949B52d883aE57e225";
const ALCX = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
     ],
    owners: [alchemixTreasury],
    ownTokens: [ALCX],
  },
})
