const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const keeperDaoTreasury = "0x9a67F1940164d0318612b497E8e6038f902a00a4";
const ROOK = "0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0xFe2e637202056d30016725477c5da089Ab0A043A',//sETH2
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.RETH,//rETH
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.WBTC,//WBTC
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',//renBTC
        ADDRESSES.ethereum.USDT
     ],
    owners: [keeperDaoTreasury],
    ownTokens: [ROOK],
  },
})
