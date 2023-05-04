const {  nullAddress,treasuryExports } = require("../helper/treasury");

const dodoTreasury = "0xAB21016BD4127638b8c555e36636449b33dF1C38";

const DODO = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//TETHER
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
     ],
    owners: [dodoTreasury],
    ownTokens: [DODO],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // WBTC
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //  USDC
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //  WETH
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', //  USDT
     ],
    owners: ['0x01d3e7271c278aa3aa56eeba6a109b2c200679fa'],
    ownTokens: ['0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581'],
  },
})