const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const oneInchTreasury = "0x7951c7ef839e26F63DA87a42C9a87986507f1c07";
const ONE_INCH = "0x111111111117dC0aa78b770fA6A738034120C302";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WBTC,//WBTC
     ],
    owners: [oneInchTreasury],
    ownTokens: [ONE_INCH]
  },
  arbitrum: {
    owners: ['0x71890ac6209fae61e9d66691c47b168b8300a7c5']
  }
})