const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //  USDC
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //  WETH
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', //  USDT
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', //  DAI
     ],
    owners: ['0xF5411006eEfD66c213d2fd2033a1d340458B7226'],
    ownTokens: ['0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585', '0x539bde0d7dbd336b79148aa742883198bbf60342'],
  },
})