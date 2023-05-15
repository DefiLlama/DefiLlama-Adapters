const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const alchemixTreasury = "0x8392F6669292fA56123F71949B52d883aE57e225";
const ALCX = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
     ],
    owners: [alchemixTreasury],
    ownTokens: [ALCX],
  },
})
