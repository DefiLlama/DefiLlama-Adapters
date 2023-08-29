const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const dodoTreasury = "0xAB21016BD4127638b8c555e36636449b33dF1C38";

const DODO = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDT,//TETHER
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [dodoTreasury],
    ownTokens: [DODO],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.WBTC, // WBTC
        ADDRESSES.arbitrum.USDC, //  USDC
        ADDRESSES.arbitrum.WETH, //  WETH
        ADDRESSES.arbitrum.USDT, //  USDT
     ],
    owners: ['0x01d3e7271c278aa3aa56eeba6a109b2c200679fa'],
    ownTokens: ['0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581'],
  },
})